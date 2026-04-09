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
} from "@ant-design/icons";
import { useAuthStore } from "../store/auth.js";

const SUPER_ADMIN_ROLE = "super_admin";

/**
 * Map sidebar routes to permission slugs (user needs at least one slug per item).
 * Adjust slugs here if your backend uses different names.
 */
const PERMISSION_SLUGS = {
  team: ["manage_content"],
  news: ["manage_blogs"],
  "showcase-projects": ["manage_content"],
  works: ["manage_content"],
  sections: ["manage_content"],
  "registered-influencers": ["manage_subscribers"],
  "subscribed-users": ["manage_subscribers"],
  admins: ["manage_admins", "view_admins"],
  banner: ["manage_content"],
  "about-banners": ["manage_content"],
};

function buildSlugSet(user) {
  if (!user?.permissions || !Array.isArray(user.permissions)) return new Set();
  return new Set(
    user.permissions
      .map((p) => (typeof p === "string" ? p : p?.slug))
      .filter(Boolean)
  );
}

function canAccessItem(key, role, slugSet) {
  if (role === SUPER_ADMIN_ROLE) return true;
  const required = PERMISSION_SLUGS[key];
  if (!required || required.length === 0) return false;
  return required.some((slug) => slugSet.has(slug));
}

function buildMenuItems(navigate) {
  return [
    {
      key: "team",
      icon: <TeamOutlined />,
      label: "Teams",
      onClick: () => navigate("/team"),
    },
    {
      key: "news",
      icon: <ReadOutlined />,
      label: "Blogs ",
      onClick: () => navigate("/news"),
    },
    {
      key: "showcase-projects",
      icon: <FundProjectionScreenOutlined />,
      label: "Showcase Projects",
      onClick: () => navigate("/showcase-projects"),
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

function filterMenuItem(item, role, slugSet) {
  if (item.children?.length) {
    const children = item.children
      .map((child) => filterMenuItem(child, role, slugSet))
      .filter(Boolean);
    if (children.length === 0) return null;
    return { ...item, children };
  }
  return canAccessItem(item.key, role, slugSet) ? item : null;
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
    const slugSet = buildSlugSet(user);
    const all = buildMenuItems(navigate);
    if (role === SUPER_ADMIN_ROLE) return all;
    return all.map((item) => filterMenuItem(item, role, slugSet)).filter(Boolean);
  }, [user, navigate]);

  return {
    menuItems,
    isProfileLoading,
    user,
    isSuperAdmin: user?.role === SUPER_ADMIN_ROLE,
    permissionSlugs: Array.from(buildSlugSet(user)),
  };
}
