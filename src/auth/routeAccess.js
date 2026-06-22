/**
 * Single source for dashboard route ↔ permission checks (sidebar + guards + redirects).
 */

export const SUPER_ADMIN_ROLE = "super_admin";

/**
 * Map sidebar menu keys to permission slugs (user needs at least one slug per item).
 */
export const PERMISSION_SLUGS = {
  statistics: ["manage_content"],
  team: ["manage_content"],
  blogs: ["manage_blogs"],
  "showcase-projects": ["manage_content"],
  works: ["manage_content"],
  sections: ["manage_content"],
  "registered-influencers": ["manage_subscribers"],
  "subscribed-users": ["manage_subscribers"],
  admins: ["manage_admins", "view_admins"],
  banner: ["manage_content"],
  "about-banners": ["manage_content"],
};

/** First match wins for default landing after login / forbidden URL. */
export const DEFAULT_DASHBOARD_PATHS = [
  { key: "statistics", path: "/statistics" },
  { key: "team", path: "/team" },
  { key: "blogs", path: "/blogs" },
  { key: "showcase-projects", path: "/showcase-projects" },
  { key: "works", path: "/works" },
  { key: "sections", path: "/influencer/sections" },
  { key: "registered-influencers", path: "/registered-influencers" },
  { key: "subscribed-users", path: "/subscribed-users" },
  { key: "admins", path: "/admins" },
  { key: "banner", path: "/banner" },
  { key: "about-banners", path: "/about-banners" },
];

export const NO_ACCESS_PATH = "/no-access";

export function buildSlugSet(user) {
  if (!user?.permissions || !Array.isArray(user.permissions)) return new Set();
  return new Set(
    user.permissions
      .map((p) => (typeof p === "string" ? p : p?.slug))
      .filter(Boolean)
  );
}

export function canAccessMenuItemKey(user, key) {
  if (!user || !key) return false;
  const role = user.role || "";
  if (role === SUPER_ADMIN_ROLE) return true;
  const slugSet = buildSlugSet(user);
  const required = PERMISSION_SLUGS[key];
  if (!required || required.length === 0) return false;
  return required.some((slug) => slugSet.has(slug));
}

/**
 * Maps URL path to a PERMISSION_SLUGS key. More specific prefixes first.
 */
export function getMenuKeyForPathname(pathname) {
  const path = (pathname || "").split("?")[0] || "";
  if (path === NO_ACCESS_PATH || path.startsWith(`${NO_ACCESS_PATH}/`)) {
    return null;
  }
  if (path.startsWith("/about-banners")) return "about-banners";
  if (path.startsWith("/banner")) return "banner";
  if (path.startsWith("/influencer/sections")) return "sections";
  if (path.startsWith("/influencer/data")) return "sections";
  if (path.startsWith("/works")) return "works";
  if (path.startsWith("/team")) return "team";
  if (path.startsWith("/showcase-projects")) return "showcase-projects";
  if (path.startsWith("/blogs")) return "blogs";
  if (path.startsWith("/statistics")) return "statistics";
  if (path.startsWith("/registered-influencers")) {
    return "registered-influencers";
  }
  if (path.startsWith("/subscribed-users")) return "subscribed-users";
  if (path.startsWith("/admins")) return "admins";
  return null;
}

export function canAccessPath(user, pathname) {
  if (!user) return false;
  const path = (pathname || "").split("?")[0] || "";
  // Index route under layout; DashboardHomeRedirect picks first allowed path.
  if (path === "/" || path === "") return true;
  if (path === NO_ACCESS_PATH || path.startsWith(`${NO_ACCESS_PATH}/`)) {
    return true;
  }
  const key = getMenuKeyForPathname(pathname);
  if (key == null) return false;
  return canAccessMenuItemKey(user, key);
}

export function getFirstAccessibleDashboardPath(user) {
  for (const { key, path } of DEFAULT_DASHBOARD_PATHS) {
    if (canAccessMenuItemKey(user, key)) return path;
  }
  return NO_ACCESS_PATH;
}

/**
 * True when we can evaluate permissions without waiting for profile fetch.
 */
export function permissionsReadyForRouteCheck(user, isProfileLoading) {
  if (!user) return !isProfileLoading;
  if (user.role === SUPER_ADMIN_ROLE) return true;
  if (Array.isArray(user.permissions)) return true;
  return !isProfileLoading;
}
