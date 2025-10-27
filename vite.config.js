import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // In production, the app is served from /dashboardTikit/ on the server
  base: "/dashboardTikit/",
  plugins: [react(), tailwindcss()],
}));
