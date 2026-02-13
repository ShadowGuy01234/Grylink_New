import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Partner Portal (EPC & NBFC) - partner.gryork.com
export default defineConfig({
  plugins: [react()],
  server: { 
    port: 5175, 
    strictPort: true,
  },
})
