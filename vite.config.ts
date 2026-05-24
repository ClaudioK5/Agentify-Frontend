import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Must match Google Cloud → Authorized JavaScript origins (no trailing slash)
    host: "localhost",
    port: 5173,
    strictPort: true,
  },
});
