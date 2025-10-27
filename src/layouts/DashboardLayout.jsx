import { Layout, Menu, Button, Dropdown, Avatar, Divider } from "antd";
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
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      type: "divider",
    },
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
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          <div className="text-white text-2xl font-bold tracking-wider">
            <span className="text-blue-400">T</span>ikit
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
        <Header className="bg-white shadow-sm flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="text-xl font-semibold text-gray-800">Dashboard</div>
          </div>
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <div className="cursor-pointer flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              <Avatar
                size="small"
                style={{ backgroundColor: "#3b82f6" }}
                icon={<UserOutlined />}
              />
              <span className="text-sm font-medium text-gray-700">
                Admin User
              </span>
            </div>
          </Dropdown>
        </Header>
        <Content className="p-6 bg-gray-50 min-h-[calc(100vh-64px)] overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm min-h-[60vh]">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default DashboardLayout;
