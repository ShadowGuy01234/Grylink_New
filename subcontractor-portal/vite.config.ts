import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Sub-Contractor Portal - app.gryork.com
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  define: {
    "import.meta.env.VITE_PORTAL_TYPE": JSON.stringify("subcontractor"),
  },
});
