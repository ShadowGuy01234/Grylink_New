import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GryLink Onboarding Portal - link.gryork.com
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
  },
});
