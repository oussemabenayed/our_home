import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          animations: ['framer-motion'],
          ui: ['lucide-react'],
          i18n: ['react-i18next', 'i18next'],
          http: ['axios'],
          charts: ['chart.js', 'react-chartjs-2'],
          toast: ['react-toastify'],
          helmet: ['react-helmet-async']
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    chunkSizeWarningLimit: 500
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-helmet-async',
      'framer-motion',
      'lucide-react',
      'axios',
      'react-i18next',
      'i18next',
      'react-toastify',
      '@react-spring/web',
      'react-text-gradients',
      'chart.js',
      'react-chartjs-2'
    ],
    force: true
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    warmup: {
      clientFiles: ['./src/main.jsx', './src/App.jsx']
    }
  }
})
