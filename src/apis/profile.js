import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL || "";

/**
 * Fetch current user profile (avoids importing apiClient to prevent circular deps with auth store).
 */
export async function getProfile() {
  let token = "";
  try {
    token = localStorage.getItem("auth_token") || "";
  } catch {
    token = "";
  }
  const { data } = await axios.get(`${baseURL}/auth/profile`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return data;
}
