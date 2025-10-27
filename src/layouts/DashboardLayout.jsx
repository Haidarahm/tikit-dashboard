import { Layout, Menu, Dropdown, Avatar } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useAuthStore } from "../store/auth.js";
import {
  UserOutlined,
  LogoutOutlined,
  FolderOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  BarcodeOutlined,
} from "@ant-design/icons";

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

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="h-screen">
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        theme="dark"
        width={260}
        className="shadow-lg"
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-600">
          <div className="text-white text-2xl font-bold tracking-wider drop-shadow-sm">
            <span className="text-blue-300">T</span>
            <span className="text-gray-50">ikit</span>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          className="border-r-0"
          items={[
            {
              key: "works",
              icon: <FolderOutlined />,
              label: "Works",
              onClick: () => navigate("/works"),
            },
            {
              key: "works-sub",
              icon: <FileTextOutlined />,
              label: "Sub Works",
              onClick: () => navigate("/works/sub"),
            },
            {
              key: "services",
              icon: <AppstoreOutlined />,
              label: "Services",
              onClick: () => navigate("/services"),
            },
            {
              key: "services-sub",
              icon: <BarcodeOutlined />,
              label: "Sub Services",
              onClick: () => navigate("/services/sub"),
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          className="bg-gray-800 shadow-md border-b border-gray-700 flex items-center justify-between px-4 md:px-6"
          style={{ height: 64 }}
        >
          <div className="flex items-center"></div>
          <div className="flex items-center">
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
              trigger={["click"]}
            >
              <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 cursor-pointer group">
                <Avatar
                  size="default"
                  className="ring-2 ring-blue-400/30"
                  style={{ backgroundColor: "#2563eb" }}
                  icon={<UserOutlined />}
                />
                <div className="hidden sm:flex flex-col items-start ml-1">
                  <span className="text-xs font-semibold text-gray-300 leading-none">
                    Admin
                  </span>
                  <span className="text-sm font-bold text-white leading-tight">
                    Dashboard
                  </span>
                </div>
              </button>
            </Dropdown>
          </div>
        </Header>
        <Content className="p-4 md:p-6 bg-gray-50 min-h-[calc(100vh-64px)] overflow-auto">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm min-h-[60vh]">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default DashboardLayout;
