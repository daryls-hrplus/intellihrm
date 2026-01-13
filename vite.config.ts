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
    target: "esnext",
    minify: "esbuild",
    cssMinify: "esbuild",
    sourcemap: false,
    reportCompressedSize: false,
    // Reduce memory pressure by processing fewer modules at once
    modulePreload: false,
    rollupOptions: {
      output: {
        // Simpler chunking to reduce bundler memory overhead
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tabs", "@radix-ui/react-popover", "@radix-ui/react-tooltip"],
          charts: ["recharts"],
          supabase: ["@supabase/supabase-js"],
          query: ["@tanstack/react-query"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
        },
      },
      // Reduce memory usage during tree-shaking
      treeshake: {
        moduleSideEffects: false,
      },
    },
    chunkSizeWarningLimit: 1500,
  },
}));
