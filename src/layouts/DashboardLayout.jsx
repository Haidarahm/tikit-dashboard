import { Layout, Menu, Dropdown, Avatar, Button, Spin } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useAuthStore } from "../store/auth.js";
import { useSidebarMenu } from "../hooks/useSidebarMenu.jsx";
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { menuItems, isProfileLoading } = useSidebarMenu();
  const [openKeys, setOpenKeys] = useState([]);
  const [collapsed, setCollapsed] = useState(false);

  const selectedKeys = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/about-banners")) return ["about-banners"];
    if (path.startsWith("/banner")) return ["banner"];
    if (path.startsWith("/influencer/sections")) return ["sections"];
    if (path.startsWith("/works")) return ["works"];
    if (path.startsWith("/team")) return ["team"];
    if (path.startsWith("/showcase-projects")) return ["showcase-projects"];
    if (path.startsWith("/news")) return ["news"];
    if (path.startsWith("/registered-influencers"))
      return ["registered-influencers"];
    if (path.startsWith("/subscribed-users"))
      return ["subscribed-users"];
    if (path.startsWith("/admins")) return ["admins"];
    return [];
  }, [location.pathname]);

  // Auto-open submenus based on current path
  useEffect(() => {
    const path = location.pathname;
    const newOpenKeys = [];
    if (path.startsWith("/registered-influencers") || path.startsWith("/subscribed-users")) {
      newOpenKeys.push("users-submenu");
    }
    if (path.startsWith("/banner") || path.startsWith("/about-banners")) {
      newOpenKeys.push("banners-submenu");
    }
    setOpenKeys(newOpenKeys);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
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
    <Layout className="h-screen min-h-0 ">
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        trigger={null}
        theme="light"
        width={260}
        className="tikit-sider shadow-sm border-r border-sidebar-border"
      >
        <div className="h-16 flex items-center justify-center border-b border-sidebar-border">
          <div className="text-2xl font-bold tracking-wider">
            <span className="text-brand-accent">T</span>
            <span className="text-gray-800">ikit</span>
          </div>
        </div>
        {isProfileLoading ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 gap-3">
            <Spin size="large" />
            <span className="text-sm text-gray-500">Loading menu…</span>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            No sections available for your account.
          </div>
        ) : (
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            className="border-r-0"
            items={menuItems}
          />
        )}
      </Sider>
      <Layout className="min-w-0 min-h-0 flex flex-col">
        <Header
          className="shadow-sm border-b border-navbar-border flex items-center justify-between px-4 md:px-6"
          style={{ height: 64, backgroundColor: "var(--color-navbar)" }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined className="text-lg" /> : <MenuFoldOutlined className="text-lg" />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: "#374151", fontSize: 18 }}
            className="flex items-center justify-center hover:!text-brand-accent"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          />
          <div className="flex items-center">
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
              trigger={["click"]}
            >
              <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-nav-hover transition-all duration-200 cursor-pointer group">
                <Avatar
                  size="default"
                  className="ring-2 ring-blue-200"
                  style={{ backgroundColor: "#2563eb" }}
                  icon={<UserOutlined />}
                />
                <div className="hidden sm:flex flex-col items-start ml-1">
                  <span className="text-xs font-semibold text-gray-400 leading-none">
                    Admin
                  </span>
                  <span className="text-sm font-bold text-gray-800 leading-tight">
                    Dashboard
                  </span>
                </div>
              </button>
            </Dropdown>
          </div>
        </Header>
        <Content className="flex-1 min-h-0 min-w-0 p-4 md:p-6 bg-gray-50 overflow-y-auto overflow-x-hidden">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm min-h-[60vh] min-w-0">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default DashboardLayout;
