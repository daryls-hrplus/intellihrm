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
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      // Limit parallel processing to reduce memory pressure
      maxParallelFileOps: 2,
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
            if (id.includes('date-fns')) return 'vendor-date';
            if (id.includes('zod') || id.includes('react-hook-form')) return 'vendor-forms';
            return 'vendor-misc';
          }
        },
      },
      // Reduce tree-shaking aggressiveness to save memory
      treeshake: {
        moduleSideEffects: 'no-external',
      },
    },
  },
}));
