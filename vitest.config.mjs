import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Komponen proyek ini berekstensi .js tapi berisi JSX (diizinkan Next.js).
  // Vite perlu diberi tahu, kalau tidak berkasnya ditolak saat parse.
  plugins: [react({ include: /\.(js|jsx)$/ })],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.jsx"],
    include: ["tests/**/*.test.{js,jsx}"],
    // Mesin kalender divalidasi skrip sendiri (npm run test:kalender) yang
    // membandingkannya dengan sumber eksternal — bukan tugas Vitest.
    exclude: ["node_modules/**", ".next/**", "scripts/**"]
  }
});
