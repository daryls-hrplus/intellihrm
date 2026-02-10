import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * In production builds (when VITE_INCLUDE_ENABLEMENT is not set),
 * replace the enablement routes module with an empty stub so the
 * entire enablement module tree (~70 components, 33 pages) is never
 * discovered, transformed, or rendered — saving ~1 GB of heap.
 */
function excludeEnablement(command: string): Plugin | false {
  // Activate for ALL builds (both production and build:dev) unless explicitly opted in
  const isExcluded =
    command === "build" && process.env.VITE_INCLUDE_ENABLEMENT !== "true";
  if (!isExcluded) return false;

  const VIRTUAL_ID = "\0virtual:empty-enablement";
  return {
    name: "exclude-enablement",
    enforce: "pre",
    resolveId(source) {
      if (
        source.includes("enablementAppRoutes") ||
        source.includes("EnablementAccessGuard")
      ) {
        return VIRTUAL_ID;
      }
    },
    load(id) {
      if (id === VIRTUAL_ID) {
        return "export function EnablementAppRoutes() { return null; }\nexport function EnablementAccessGuard({ children }) { return children; }\nexport default {};";
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    excludeEnablement(command),
    react(),
    command === "serve" && mode === "development" && componentTagger(),
  ].filter(Boolean),
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

          // Split app into granular chunks to stay within memory limits
          if (id.includes("/src/pages/enablement/")) return "app-pages-enablement";
          if (id.includes("/src/pages/mss/")) return "app-pages-mss";
          if (id.includes("/src/pages/ess/")) return "app-pages-ess";
          if (id.includes("/src/pages/admin/")) return "app-pages-admin";
          if (id.includes("/src/pages/performance/")) return "app-pages-performance";
          if (id.includes("/src/pages/workforce/")) return "app-pages-workforce";
          if (id.includes("/src/pages/payroll/")) return "app-pages-payroll";
          if (id.includes("/src/pages/")) return "app-pages";
          if (id.includes("/src/components/enablement/")) return "app-components-enablement";
          if (id.includes("/src/components/")) return "app-components";
          if (id.includes("/src/")) return "app-core";
        },
      },
    },
  },
}));
