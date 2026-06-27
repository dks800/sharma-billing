import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("node_modules/@react-pdf/pdfkit")) {
            return "pdfkit";
          }

          if (
            id.includes("node_modules/@react-pdf/font") ||
            id.includes("node_modules/fontkit") ||
            id.includes("node_modules/brotli") ||
            id.includes("node_modules/unicode-") ||
            id.includes("node_modules/linebreak") ||
            id.includes("node_modules/hyphen")
          ) {
            return "pdf-fonts";
          }

          if (id.includes("node_modules/@react-pdf/layout")) {
            return "pdf-layout";
          }

          if (
            id.includes("node_modules/@react-pdf/textkit") ||
            id.includes("node_modules/yoga-layout")
          ) {
            return "pdf-textkit";
          }

          if (
            id.includes("node_modules/@react-pdf/image") ||
            id.includes("node_modules/@react-pdf/png-js")
          ) {
            return "pdf-images";
          }

          if (
            id.includes("node_modules/@react-pdf/render") ||
            id.includes("node_modules/@react-pdf/reconciler") ||
            id.includes("node_modules/@react-pdf/renderer")
          ) {
            return "react-pdf";
          }

          if (id.includes("node_modules/@react-pdf")) {
            return "pdf-core";
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
