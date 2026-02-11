import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Sub-Contractor Portal - app.gryork.com
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { 
    port: 5173, 
    strictPort: true,
  },
  define: {
    'import.meta.env.VITE_PORTAL_TYPE': JSON.stringify('subcontractor'),
  },
})
