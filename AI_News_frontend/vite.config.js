import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
server: {
    proxy: {
  // Only proxy calls starting with /api
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  },
  // Keep your image proxy as is, but ensure it's specific
  '/article-image-proxy': { 
     target: 'http://localhost:5000',
     // ...
  }
  }
}
});

