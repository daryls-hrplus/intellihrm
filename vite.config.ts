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
    minify: "esbuild",
    cssMinify: "esbuild",
    sourcemap: false,
    reportCompressedSize: false,
    modulePreload: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router')) return 'vendor-react';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('@tanstack')) return 'vendor-query';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('i18next')) return 'vendor-i18n';
            return 'vendor';
          }
          if (id.includes('/pages/workforce/')) return 'pages-workforce';
          if (id.includes('/pages/payroll/')) return 'pages-payroll';
          if (id.includes('/pages/admin/')) return 'pages-admin';
          if (id.includes('/pages/recruitment/')) return 'pages-recruitment';
          if (id.includes('/pages/performance/')) return 'pages-performance';
          if (id.includes('/pages/learning/')) return 'pages-learning';
          if (id.includes('/pages/leave/')) return 'pages-leave';
          if (id.includes('/pages/compensation/')) return 'pages-compensation';
          if (id.includes('/pages/time-attendance/')) return 'pages-time';
          if (id.includes('/pages/')) return 'pages-other';
        },
      },
    },
  },
}));
