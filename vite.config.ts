import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("node_modules/@react-pdf") ||
            id.includes("node_modules/yoga-layout") ||
            id.includes("node_modules/pdfkit") ||
            id.includes("node_modules/fontkit") ||
            id.includes("node_modules/brotli") ||
            id.includes("node_modules/unicode-") ||
            id.includes("node_modules/linebreak") ||
            id.includes("node_modules/hyphen") ||
            id.includes("node_modules/png-js")
          ) {
            return "react-pdf";
          }

          if (
            id.includes("node_modules/firebase") ||
            id.includes("node_modules/@firebase")
          ) {
            return "firebase";
          }

          if (
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/@remix-run")
          ) {
            return "router";
          }

          if (id.includes("node_modules/react-icons")) {
            return "icons";
          }

          if (id.includes("node_modules/framer-motion")) {
            return "motion";
          }

          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/scheduler")
          ) {
            return "react";
          }
        },
      },
    },
  },
});
