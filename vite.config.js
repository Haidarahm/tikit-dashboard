import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  // In production, the app is served from /dashboardTikit/ on the server
  base: "/",
  plugins: [react(), tailwindcss()],
}));
