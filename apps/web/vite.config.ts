import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: ["websocket-quick-start-web.onrender.com"],
  },
});
