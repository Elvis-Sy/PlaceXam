import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwind(),
  ],
  server: {
    host: "127.0.0.1",
    port: 5174,
    strictPort: false, 
    open: true, 
  },
  preview: {
    port: 5000,
  },
});
