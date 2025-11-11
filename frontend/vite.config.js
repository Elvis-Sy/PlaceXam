import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1", // ✅ évite le bug IPv6 (::1)
    port: 5174,
    strictPort: false, // autorise à changer de port si 3001 est occupé
    open: true,        // ouvre automatiquement le navigateur
  },
  preview: {
    port: 5000,
  },
});
