import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GryLink Onboarding Portal - link.gryork.com
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { 
    port: 5177, 
    strictPort: true,
  },
})
