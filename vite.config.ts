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
          // Vendor chunks - keep separate for caching
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
            if (id.includes("mermaid") || id.includes("react-markdown") || id.includes("marked")) return "vendor-content";
            if (id.includes("docx") || id.includes("pptx") || id.includes("jspdf") || id.includes("html2canvas")) return "vendor-export";
            return "vendor-misc";
          }

          // Pages: group by top-level folder under src/pages
          const pagesMarker = "/src/pages/";
          const pagesIdx = id.indexOf(pagesMarker);
          if (pagesIdx !== -1) {
            const rel = id.slice(pagesIdx + pagesMarker.length);
            const top = rel.split("/")[0] ?? "core";
            if (/\.(t|j)sx?$/.test(top)) return "pages-core";
            return `pages-${top}`;
          }

          // Components: group by top-level folder under src/components
          const componentsMarker = "/src/components/";
          const componentsIdx = id.indexOf(componentsMarker);
          if (componentsIdx !== -1) {
            const rel = id.slice(componentsIdx + componentsMarker.length);
            const top = rel.split("/")[0] ?? "core";
            if (/\.(t|j)sx?$/.test(top)) return "components-core";
            return `components-${top}`;
          }

          // Hooks/utils/lib: keep consolidated
          if (
            id.includes("/src/hooks/") ||
            id.includes("/src/utils/") ||
            id.includes("/src/lib/")
          ) {
            return "app-utils";
          }
        },
      },
    },
  },
}));
