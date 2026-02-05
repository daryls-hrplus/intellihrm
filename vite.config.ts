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
        // Keep chunk count low (avoid Rollup generating thousands of tiny chunks),
        // but also avoid a single massive bundle which can OOM while concatenating.
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react-router")) return "vendor-react";
            if (id.includes("@radix-ui")) return "vendor-radix";
            if (id.includes("recharts")) return "vendor-charts";
            if (id.includes("@supabase")) return "vendor-backend";
            if (id.includes("@tanstack")) return "vendor-query";
            if (id.includes("lucide-react")) return "vendor-icons";
            if (id.includes("i18next")) return "vendor-i18n";
            if (id.includes("date-fns")) return "vendor-date";
            if (id.includes("zod") || id.includes("react-hook-form")) return "vendor-forms";
            return "vendor-misc";
          }

          // Group pages by top-level folder to reduce chunk graph complexity.
          const pagesMarker = "/src/pages/";
          const idx = id.indexOf(pagesMarker);
          if (idx !== -1) {
            const rel = id.slice(idx + pagesMarker.length);
            const top = rel.split("/")[0] ?? "core";
            if (top.endsWith(".ts") || top.endsWith(".tsx") || top.endsWith(".js") || top.endsWith(".jsx")) {
              return "pages-core";
            }
            return `pages-${top}`;
          }
        },
      },
    },
  },
}));
