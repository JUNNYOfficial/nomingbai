import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true,
    // Transpile modern syntax for Safari 13+ compatibility
    target: ['safari13', 'chrome80', 'firefox72'],
    rollupOptions: {
      output: {
        // Fixed filenames so cached HTML never references deleted files
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (info) => {
          if (info.name === 'index.css') return 'assets/[name].[ext]'
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})
