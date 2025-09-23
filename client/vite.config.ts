import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
<<<<<<< HEAD

export default defineConfig({
  plugins: [react()],
=======
import path from "path";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
>>>>>>> 32d5f122908ecc6eeb1027177bd5573a971409f7
  server: {
    port: 5173,
    proxy: {
      "/api": {
<<<<<<< HEAD
        target: "http://127.0.0.1:5000", // for local dev only
        changeOrigin: true,
      }
    }
  }
=======
        target: "http://127.0.0.1:5000", // dev only
        changeOrigin: true,
      },
    },
  },
>>>>>>> 32d5f122908ecc6eeb1027177bd5573a971409f7
});
