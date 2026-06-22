import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TeamOutlined,
  ReadOutlined,
  FundProjectionScreenOutlined,
  FolderOutlined,
  UnorderedListOutlined,
  ContactsOutlined,
  MailOutlined,
  VideoCameraOutlined,
  PlaySquareOutlined,
  BarChartOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../store/auth.js";
import {
  SUPER_ADMIN_ROLE,
  buildSlugSet,
  canAccessMenuItemKey,
} from "../auth/routeAccess.js";

function canAccessItem(key, user) {
  return canAccessMenuItemKey(user, key);
}

function buildMenuItems(navigate) {
  return [
    {
      key: "statistics",
      icon: <BarChartOutlined />,
      label: "Statistecs",
      onClick: () => navigate("/statistics"),
    },
    {
      key: "team",
      icon: <TeamOutlined />,
      label: "Teams",
      onClick: () => navigate("/team"),
    },
    {
      key: "blogs",
      icon: <ReadOutlined />,
      label: "Blogs ",
      onClick: () => navigate("/blogs"),
    },
    {
      key: "showcase-projects",
      icon: <FundProjectionScreenOutlined />,
      label: "Showcase Projects",
      onClick: () => navigate("/showcase-projects"),
    },
    {
      key: "featured-campaigns",
      icon: <StarOutlined />,
      label: "Featured Campaigns",
      onClick: () => navigate("/featured-campaigns"),
    },
    {
      key: "works",
      icon: <FolderOutlined />,
      label: "Works Sections",
      onClick: () => navigate("/works"),
    },
    {
      key: "sections",
      icon: <UnorderedListOutlined />,
      label: "Influencer Sections",
      onClick: () => navigate("/influencer/sections"),
    },
    {
      key: "users-submenu",
      icon: <ContactsOutlined />,
      label: "Users",
      children: [
        {
          key: "registered-influencers",
          icon: <ContactsOutlined />,
          label: "Registered Influencers",
          onClick: () => navigate("/registered-influencers"),
        },
        {
          key: "subscribed-users",
          icon: <MailOutlined />,
          label: "Subscribed Users",
          onClick: () => navigate("/subscribed-users"),
        },
        {
          key: "admins",
          icon: <TeamOutlined />,
          label: "Admins",
          onClick: () => navigate("/admins"),
        },
      ],
    },
    {
      key: "banners-submenu",
      icon: <VideoCameraOutlined />,
      label: "Banners",
      children: [
        {
          key: "banner",
          icon: <VideoCameraOutlined />,
          label: "Banner Videos",
          onClick: () => navigate("/banner"),
        },
        {
          key: "about-banners",
          icon: <PlaySquareOutlined />,
          label: "About Us Banners",
          onClick: () => navigate("/about-banners"),
        },
      ],
    },
  ];
}

function filterMenuItem(item, user) {
  if (item.children?.length) {
    const children = item.children
      .map((child) => filterMenuItem(child, user))
      .filter(Boolean);
    if (children.length === 0) return null;
    return { ...item, children };
  }
  return canAccessItem(item.key, user) ? item : null;
}

/**
 * Loads profile (role + permissions), returns Ant Design Menu `items` filtered by access.
 */
export function useSidebarMenu() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isProfileLoading = useAuthStore((s) => s.isProfileLoading);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  useEffect(() => {
    if (!token) return;
    fetchProfile();
  }, [token, fetchProfile]);

  const menuItems = useMemo(() => {
    const role = user?.role || "";
    const all = buildMenuItems(navigate);
    if (role === SUPER_ADMIN_ROLE) return all;
    return all.map((item) => filterMenuItem(item, user)).filter(Boolean);
  }, [user, navigate]);

  return {
    menuItems,
    isProfileLoading,
    user,
    isSuperAdmin: user?.role === SUPER_ADMIN_ROLE,
    permissionSlugs: Array.from(buildSlugSet(user)),
  };
}
