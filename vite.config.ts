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
    target: "esnext",

    // Reduce peak memory usage during production builds in very large projects.
    // Trade-off: larger output bundles, but stable builds in constrained CI memory.
    minify: false,
    cssMinify: false,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    modulePreload: false,
    chunkSizeWarningLimit: 3000,

    rollupOptions: {
      // Tree-shaking can be memory intensive for huge module graphs.
      treeshake: false,

      output: {
        // Balanced chunking: avoid thousands of tiny chunks *and* avoid a single massive chunk
        // which can OOM while concatenating during "rendering chunks...".
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react-router")) return "vendor-react";
            if (id.includes("@radix-ui")) return "vendor-radix";
            if (id.includes("recharts")) return "vendor-charts";
            if (id.includes("@supabase")) return "vendor-backend";
            if (id.includes("@tanstack")) return "vendor-query";
            if (id.includes("lucide-react")) return "vendor-icons";
            return "vendor-misc";
          }

          // Split app into 3 chunks to balance graph complexity vs chunk size
          if (id.includes("/src/pages/")) return "app-pages";
          if (id.includes("/src/components/")) return "app-components";
          if (id.includes("/src/")) return "app-core";
        },
      },
    },
  },
}));
