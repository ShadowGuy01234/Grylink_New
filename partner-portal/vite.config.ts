import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Partner Portal (EPC & NBFC) - partner.gryork.com
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { 
    port: 5175, 
    strictPort: true,
  },
})
