import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL || "";

// Public client for login endpoint (no auth token needed)
const publicClient = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export async function login(credentials) {
  const { data } = await publicClient.post("/auth/login", credentials);
  return data;
}
