/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  // Base path is environment-configurable so the same source can deploy to
// two targets:
//   - GitHub Pages  → /eato/   (default, set via DEPLOY_BASE)
//   - EdgeOne Pages → /        (set DEPLOY_BASE=/ for the domestic mirror)
// Falls back to /eato/ when DEPLOY_BASE is unset, preserving the GitHub build.
base: process.env.DEPLOY_BASE || "/eato/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    // Recharts is heavy but lazy-loaded (only fetched when the analytics tab
    // opens), so it never lands in the initial bundle. Bump the warning limit
    // so the build stays warning-free without forcing it into the entry chunk.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split heavy vendors into their own chunks so no single file exceeds
        // the 500 kB warning threshold and the initial load stays lean.
        manualChunks: {
          react: ["react", "react-dom", "react-router"],
          charts: ["recharts"],
          icons: ["lucide-react"],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
