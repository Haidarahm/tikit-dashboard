import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Col,
  DatePicker,
  Progress,
  Row,
  Spin,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  Typography,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { FaBriefcase, FaBlog, FaUserFriends, FaUsers, FaEye, FaUser, FaClock } from "react-icons/fa";
import dayjs from "dayjs";
import { Line } from "@ant-design/charts";
import { getStatistics } from "../apis/statistics.js";
import {
  getAnalyticsSummary,
  getAnalyticsSources,
  getAnalyticsPages,
  getAnalyticsSections,
  getAnalyticsTimeseries,
} from "../apis/analytics.js";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

function defaultRange() {
  return [dayjs().subtract(29, "day"), dayjs()];
}

function formatRange(range) {
  const [from, to] = range || [];
  return {
    from: from ? from.format("YYYY-MM-DD") : undefined,
    to: to ? to.format("YYYY-MM-DD") : undefined,
  };
}

function Statistics() {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const [range, setRange] = useState(defaultRange);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [sources, setSources] = useState(null);
  const [pages, setPages] = useState(null);
  const [sections, setSections] = useState(null);
  const [timeseries, setTimeseries] = useState(null);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const resp = await getStatistics();
      setStats(resp?.data ?? resp ?? null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch statistics");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    const params = formatRange(range);
    try {
      const [summaryResp, sourcesResp, pagesResp, sectionsResp, seriesResp] =
        await Promise.all([
          getAnalyticsSummary(params),
          getAnalyticsSources(params),
          getAnalyticsPages(params),
          getAnalyticsSections(params),
          getAnalyticsTimeseries(params),
        ]);

      setSummary(summaryResp?.data ?? summaryResp ?? null);
      setSources(sourcesResp?.data ?? sourcesResp ?? null);
      setPages(pagesResp?.data ?? pagesResp ?? null);
      setSections(sectionsResp?.data ?? sectionsResp ?? null);
      setTimeseries(seriesResp?.data ?? seriesResp ?? null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch website analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

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
        render: (text, row) => <Tag color={row.color}>{text}</Tag>,
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
            strokeColor={
              row.color === "red" ? "#ff4d4f" : row.color === "green" ? "#52c41a" : "#fadb14"
            }
          />
        ),
      },
    ],
    [totalBreakdown]
  );

  const pageColumns = [
    { title: "Path", dataIndex: "path", key: "path" },
    {
      title: "Pageviews",
      dataIndex: "count",
      key: "count",
      align: "right",
      render: (v) => <span className="font-semibold">{v}</span>,
    },
  ];

  const referrerColumns = [
    { title: "Referrer", dataIndex: "referrer", key: "referrer" },
    {
      title: "Hits",
      dataIndex: "count",
      key: "count",
      align: "right",
      render: (v) => <span className="font-semibold">{v}</span>,
    },
  ];

  const utmColumns = [
    { title: "UTM source", dataIndex: "utm_source", key: "utm_source" },
    {
      title: "Hits",
      dataIndex: "count",
      key: "count",
      align: "right",
      render: (v) => <span className="font-semibold">{v}</span>,
    },
  ];

  const sectionColumns = [
    { title: "Section", dataIndex: "section_key", key: "section_key" },
    {
      title: "Views",
      dataIndex: "count",
      key: "count",
      align: "right",
      render: (v) => <span className="font-semibold">{v}</span>,
    },
  ];

  const lineConfig = useMemo(
    () => ({
      data: timeseries?.series ?? [],
      xField: "date",
      yField: "count",
      height: 280,
      smooth: true,
      point: { size: 3 },
      axis: {
        x: { title: false },
        y: { title: false },
      },
      style: { lineWidth: 2 },
      interaction: { tooltip: true },
    }),
    [timeseries]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Statistics</h2>
          <p className="text-gray-600">Dashboard overview of key content & user metrics.</p>
        </div>
        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={fetchStats} disabled={isLoading}>
            Refresh CMS
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
              <Card title="Subscribed Influencers Status" bordered={false} className="shadow-sm">
                <Table
                  rowKey={(r) => r.key}
                  columns={columns}
                  scroll={{ x: "max-content" }}
                  dataSource={breakdownRows}
                  pagination={false}
                />
              </Card>
            </Col>
            <Col xs={24} lg={10}>
              <div className="space-y-4">
                <Card title="Case Studies Breakdown" bordered={false} className="shadow-sm">
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
                      <span className="font-semibold">
                        {stats?.case_studies ?? totalCaseStudies}
                      </span>
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

      {/* Website traffic (first-party analytics) */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Website traffic
            </Title>
            <Text type="secondary">
              First-party analytics from consenting visitors (pageviews, sources, sections).
            </Text>
          </div>
          <Space wrap>
            <RangePicker
              value={range}
              onChange={(value) => setRange(value?.length === 2 ? value : defaultRange())}
              allowClear={false}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchAnalytics}
              loading={analyticsLoading}
            >
              Refresh traffic
            </Button>
          </Space>
        </div>

        {analyticsLoading && !summary ? (
          <div className="flex justify-center items-center min-h-[20vh]">
            <Spin />
          </div>
        ) : (
          <>
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} md={8}>
                <Card bordered={false} className="shadow-sm">
                  <Statistic
                    title="Pageviews"
                    value={summary?.pageviews ?? 0}
                    prefix={<FaEye className="text-blue-600" />}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card bordered={false} className="shadow-sm">
                  <Statistic
                    title="Unique visitors"
                    value={summary?.unique_visitors ?? 0}
                    prefix={<FaUser className="text-green-600" />}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card bordered={false} className="shadow-sm">
                  <Statistic
                    title="Sessions"
                    value={summary?.sessions ?? 0}
                    prefix={<FaClock className="text-purple-600" />}
                  />
                </Card>
              </Col>
            </Row>

            <Card title="Pageviews over time" bordered={false} className="shadow-sm mb-4">
              {(timeseries?.series?.length ?? 0) > 0 ? (
                <Line {...lineConfig} />
              ) : (
                <Text type="secondary">No pageview data in this range yet.</Text>
              )}
            </Card>

            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Top pages" bordered={false} className="shadow-sm">
                  <Table
                    rowKey={(r) => r.path}
                    columns={pageColumns}
                    dataSource={pages?.pages ?? []}
                    pagination={false}
                    size="small"
                    locale={{ emptyText: "No data" }}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Top home sections" bordered={false} className="shadow-sm">
                  <Table
                    rowKey={(r) => r.section_key}
                    columns={sectionColumns}
                    dataSource={sections?.sections ?? []}
                    pagination={false}
                    size="small"
                    locale={{ emptyText: "No data" }}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Top referrers" bordered={false} className="shadow-sm">
                  <Table
                    rowKey={(r) => r.referrer}
                    columns={referrerColumns}
                    dataSource={sources?.referrers ?? []}
                    pagination={false}
                    size="small"
                    locale={{ emptyText: "No data" }}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="UTM sources" bordered={false} className="shadow-sm">
                  <Table
                    rowKey={(r) => r.utm_source}
                    columns={utmColumns}
                    dataSource={sources?.utm_sources ?? []}
                    pagination={false}
                    size="small"
                    locale={{ emptyText: "No data" }}
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>
    </div>
  );
}

export default Statistics;
