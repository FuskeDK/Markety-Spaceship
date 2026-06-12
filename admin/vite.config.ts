// Vite build config. Key points:
//   - Dev server on port 8080 with HMR overlay disabled
//   - `@` alias resolves to src/ for clean imports
//   - Manual chunk splitting keeps the initial bundle small:
//     vendor-react (React + router), vendor-motion (framer-motion),
//     vendor-query (tanstack), vendor-radix (shadcn primitives)
//   - lovable-tagger plugin runs in dev mode only (Lovable.dev integration)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@vercel/speed-insights/next": path.resolve(__dirname, "./node_modules/@vercel/speed-insights/dist/react/index.mjs"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'vendor-react';
          }
          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }
          if (id.includes('@radix-ui')) {
            return 'vendor-radix';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));
