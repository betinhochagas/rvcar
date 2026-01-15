import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Base path - change to '/your-subfolder/' if deploying to subdirectory
  base: '/',
  server: {
    host: "::",
    port: 8080,
    // Proxy para APIs - redireciona /api para Vercel
    proxy: {
      '/api': {
        target: 'https://rvcar.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks para melhor cache
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'utils-vendor': ['date-fns', 'zod', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
}));
