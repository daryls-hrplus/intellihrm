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
        // Manual chunking to reduce bundle size per chunk
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tabs"],
          charts: ["recharts"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
