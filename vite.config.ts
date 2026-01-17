import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteCompression from 'vite-plugin-compression';

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
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    // Compressão Brotli para produção
    mode === "production" && viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
    // Compressão Gzip como fallback
    mode === "production" && viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks para melhor cache
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            if (id.includes('date-fns') || id.includes('zod') || id.includes('clsx')) {
              return 'utils-vendor';
            }
            // Outros node_modules em chunk separado
            return 'vendor';
          }
          // Admin pages em chunk separado
          if (id.includes('/pages/Admin') || id.includes('/pages/SiteSettings')) {
            return 'admin';
          }
        },
        // Otimizar nomes de arquivos para cache
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
}));
