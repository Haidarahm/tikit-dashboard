import { Layout, Menu, Button } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useAuthStore } from "../store/auth.js";

const { Header, Sider, Content } = Layout;

function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const selectedKeys = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/works/sub")) return ["works-sub"];
    if (path.startsWith("/works")) return ["works"];
    if (path.startsWith("/services/sub")) return ["services-sub"];
    if (path.startsWith("/services")) return ["services"];
    return [];
  }, [location.pathname]);

  return (
    <Layout className="min-h-screen">
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="text-white text-xl font-semibold py-4 px-4">Tikit</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={[
            { key: "works", label: "Works", onClick: () => navigate("/works") },
            {
              key: "works-sub",
              label: "Sub Works",
              onClick: () => navigate("/works/sub"),
            },
            {
              key: "services",
              label: "Services",
              onClick: () => navigate("/services"),
            },
            {
              key: "services-sub",
              label: "Sub Services",
              onClick: () => navigate("/services/sub"),
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header className="bg-white flex items-center justify-between px-4">
          <div className="text-lg font-medium">Dashboard</div>
          <Button
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            Logout
          </Button>
        </Header>
        <Content className="p-4 bg-gray-50">
          <div className="bg-white p-4 rounded-md shadow-sm min-h-[60vh]">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default DashboardLayout;
