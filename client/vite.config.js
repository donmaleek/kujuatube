import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_PROXY_TARGET || "http://localhost:5000";

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 3000,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true
        },
        "/uploads": {
          target: apiTarget,
          changeOrigin: true
        }
      }
    }
  };
});
