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
        // Group chunks by module to reduce number of HTTP requests
        manualChunks(id) {
          // Core vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('@tanstack')) {
              return 'vendor-query';
            }
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'vendor-forms';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('date-fns') || id.includes('i18next')) {
              return 'vendor-utils';
            }
          }
          
          // Group pages by module to reduce chunk fragmentation
          if (id.includes('/pages/workforce/')) return 'pages-workforce';
          if (id.includes('/pages/performance/')) return 'pages-performance';
          if (id.includes('/pages/leave/')) return 'pages-leave';
          if (id.includes('/pages/payroll/')) return 'pages-payroll';
          if (id.includes('/pages/compensation/')) return 'pages-compensation';
          if (id.includes('/pages/recruitment/')) return 'pages-recruitment';
          if (id.includes('/pages/learning/')) return 'pages-learning';
          if (id.includes('/pages/admin/')) return 'pages-admin';
          if (id.includes('/pages/ess/')) return 'pages-ess';
          if (id.includes('/pages/mss/')) return 'pages-mss';
          if (id.includes('/pages/hse/')) return 'pages-hse';
          if (id.includes('/pages/relations/')) return 'pages-relations';
          if (id.includes('/pages/enablement/')) return 'pages-enablement';
          if (id.includes('/pages/hr-hub/')) return 'pages-hr-hub';
          if (id.includes('/pages/time-attendance/')) return 'pages-time';
          if (id.includes('/pages/property/')) return 'pages-property';
          if (id.includes('/pages/succession/')) return 'pages-succession';
          if (id.includes('/pages/ai/')) return 'pages-ai';
          if (id.includes('/pages/help/')) return 'pages-help';
          
          // Group shared components
          if (id.includes('/components/ui/')) return 'components-ui';
          if (id.includes('/components/dashboard/')) return 'components-dashboard';
          if (id.includes('/components/layout/')) return 'components-layout';
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
