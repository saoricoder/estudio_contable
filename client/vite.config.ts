import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["favicon.svg", "icons.svg", "pwa-192.png", "pwa-512.png"],
      manifest: {
        id: "/",
        name: "Estudio Contable",
        short_name: "Estudio Contable",
        description:
          "Estudio Contable Eficiente · Contadores Unidos MX — clientes, nómina, facturación y conciliación.",
        theme_color: "#0b1220",
        background_color: "#f8fafc",
        display: "standalone",
        orientation: "any",
        lang: "es-MX",
        scope: "/",
        start_url: "/",
        categories: ["business", "finance", "productivity"],
        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
