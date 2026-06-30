import { useEffect, useMemo, useState } from "react";
import { Card, Col, Progress, Row, Spin, Statistic, Table, Tag, Button, Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { FaBriefcase, FaBlog, FaUserFriends, FaUsers } from "react-icons/fa";
import { getStatistics } from "../apis/statistics.js";

function Statistics() {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const resp = await getStatistics();
      // Backend returns: { status, message, data: { ... } }
      setStats(resp?.data ?? resp ?? null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch statistics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const subscribedInfluencers = useMemo(
    () => stats?.subscribed_influencers ?? {},
    [stats]
  );

  const caseStudiesByType = useMemo(
    () => stats?.case_studies_by_type ?? {},
    [stats]
  );
  const breakdownRows = useMemo(
    () => [
      {
        key: "pending",
        label: "Pending",
        value: Number(subscribedInfluencers.pending ?? 0),
        color: "gold",
      },
      {
        key: "accepted",
        label: "Accepted",
        value: Number(subscribedInfluencers.accepted ?? 0),
        color: "green",
      },
      {
        key: "rejected",
        label: "Rejected",
        value: Number(subscribedInfluencers.rejected ?? 0),
        color: "red",
      },
    ],
    [subscribedInfluencers]
  );

  const totalBreakdown = breakdownRows.reduce((sum, r) => sum + r.value, 0) || 1;

  const caseStudyTypeRows = useMemo(
    () => [
      { key: "influences", label: "Influences", value: Number(caseStudiesByType.influences ?? 0), color: "#1677ff" },
      { key: "socials", label: "Socials", value: Number(caseStudiesByType.socials ?? 0), color: "#52c41a" },
      { key: "events", label: "Events", value: Number(caseStudiesByType.events ?? 0), color: "#faad14" },
      { key: "digitals", label: "Digitals", value: Number(caseStudiesByType.digitals ?? 0), color: "#722ed1" },
    ],
    [caseStudiesByType]
  );

  const totalCaseStudies = caseStudyTypeRows.reduce((sum, r) => sum + r.value, 0) || 1;

  const columns = useMemo(
    () => [
      {
        title: "Status",
        dataIndex: "label",
        key: "label",
        render: (text, row) => (
          <Tag color={row.color}>
            {text}
          </Tag>
        ),
      },
      {
        title: "Count",
        dataIndex: "value",
        key: "value",
        align: "right",
        render: (value) => <span className="font-semibold">{value}</span>,
      },
      {
        title: "Share",
        dataIndex: "value",
        key: "valueShare",
        render: (_, row) => (
          <Progress
            percent={Math.round((row.value / totalBreakdown) * 100)}
            showInfo={false}
            strokeColor={row.color === "red" ? "#ff4d4f" : row.color === "green" ? "#52c41a" : "#fadb14"}
          />
        ),
      },
    ],
    [totalBreakdown]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Statistecs</h2>
          <p className="text-gray-600">Dashboard overview of key content & user metrics.</p>
        </div>
        <Space wrap>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchStats}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {isLoading && !stats ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <Spin size="large" />
        </div>
      ) : null}

      {stats ? (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={6}>
              <Card bordered={false} className="shadow-sm">
                <Statistic
                  title="Work Sections"
                  value={stats?.work_sections ?? stats?.work_items ?? 0}
                  prefix={<FaBriefcase className="text-blue-600" />}
                />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card bordered={false} className="shadow-sm">
                <Statistic
                  title="Blogs"
                  value={stats?.blogs ?? 0}
                  prefix={<FaBlog className="text-purple-600" />}
                />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card bordered={false} className="shadow-sm">
                <Statistic
                  title="Influencers"
                  value={stats?.influencers ?? 0}
                  prefix={<FaUserFriends className="text-green-600" />}
                />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card bordered={false} className="shadow-sm">
                <Statistic
                  title="Subscribed Users"
                  value={stats?.subscribed_users ?? 0}
                  prefix={<FaUsers className="text-orange-600" />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <Card
                title="Subscribed Influencers Status"
                bordered={false}
                className="shadow-sm"
              >
                <Table
                  rowKey={(r) => r.key}
                  columns={columns}
                  scroll={{ x: 'max-content' }}
                  dataSource={breakdownRows}
                  pagination={false}
                />
              </Card>
            </Col>
            <Col xs={24} lg={10}>
              <div className="space-y-4">
                <Card
                  title="Case Studies Breakdown"
                  bordered={false}
                  className="shadow-sm"
                >
                  <div className="space-y-4">
                    {caseStudyTypeRows.map((row) => (
                      <div key={row.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{row.label}</span>
                          <span className="font-semibold">{row.value}</span>
                        </div>
                        <Progress
                          percent={Math.round((row.value / totalCaseStudies) * 100)}
                          showInfo={false}
                          strokeColor={row.color}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
                <Card bordered={false} className="shadow-sm" title="Quick Totals">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Case Studies</span>
                      <span className="font-semibold">{stats?.case_studies ?? totalCaseStudies}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Subscribed Influencers</span>
                      <span className="font-semibold">{totalBreakdown}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </Col>
          </Row>
        </>
      ) : null}
    </div>
  );
}

export default Statistics;

