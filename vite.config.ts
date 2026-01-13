import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), command === "serve" && mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Reduce memory usage during build
    // Minify even in "development" build mode to avoid OOM during chunk rendering
    minify: "esbuild",
    cssMinify: "esbuild",
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // Manual chunking to reduce bundle size per chunk and memory usage
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          "ui-core": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tabs"],
          "ui-forms": ["@radix-ui/react-checkbox", "@radix-ui/react-select", "@radix-ui/react-radio-group", "@radix-ui/react-switch"],
          "ui-overlay": ["@radix-ui/react-popover", "@radix-ui/react-tooltip", "@radix-ui/react-hover-card", "@radix-ui/react-alert-dialog"],
          "ui-layout": ["@radix-ui/react-accordion", "@radix-ui/react-collapsible", "@radix-ui/react-scroll-area", "@radix-ui/react-separator"],
          charts: ["recharts"],
          supabase: ["@supabase/supabase-js"],
          query: ["@tanstack/react-query"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          dates: ["date-fns", "react-day-picker"],
          i18n: ["i18next", "react-i18next", "i18next-browser-languagedetector"],
          dnd: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
          docs: ["jspdf", "docx", "pptxgenjs", "file-saver", "html2canvas"],
          mermaid: ["mermaid"],
          mapbox: ["mapbox-gl"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
