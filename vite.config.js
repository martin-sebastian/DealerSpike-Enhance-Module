import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  publicDir: "../public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        keyTags: resolve(__dirname, "key-tags/index.html"),
        calendar: resolve(__dirname, "calendar/index.html"),
        quote: resolve(__dirname, "quote/index.html"),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@assets": resolve(__dirname, "./public/assets"),
    },
  },
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "bootstrap/scss/bootstrap";`,
      },
    },
  },
  optimizeDeps: {
    include: ["bootstrap", "bootstrap-icons", "moment", "numeral", "sql.js"],
  },
});
