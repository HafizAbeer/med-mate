import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isDev = mode === "development";
  const proxyTarget =
    env.VITE_DEV_PROXY_TARGET || 
    (isDev ? "http://localhost:5001" : "https://med-mate-lqkw.vercel.app");

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: isDev ? false : true,
        },
      },
    },
  };
});
