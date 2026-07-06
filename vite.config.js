import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Folder ini di-sync OneDrive; tanpa ignore ini Vite restart terus-menerus
    // karena file .env/.ENV tersentuh oleh sync.
    watch: {
      ignored: ['**/.env', '**/.ENV', '**/.env.*'],
    },
  },
})
