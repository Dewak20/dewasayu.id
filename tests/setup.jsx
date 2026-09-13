import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/* next/image butuh runtime Next yang tidak ada di jsdom. Diganti <img> biasa
   supaya tes bisa fokus pada perilaku, bukan pada pipeline optimasi gambar —
   yang memang sudah diverifikasi terpisah lewat ukuran berkas yang dihasilkan. */
vi.mock("next/image", () => ({
  default: ({ src, alt, fill, sizes, ...sisa }) => {
    const props = { src: typeof src === "string" ? src : "", alt, ...sisa };
    delete props.priority;
    delete props.quality;
    return <img {...props} />;
  }
}));

/* next/dynamic memuat CatatanDewasa (korpus 220 aturan, ~200 kB). Tidak perlu
   dimuat untuk menguji CRUD, dan membuatnya sinkron menghindari flaky. */
vi.mock("next/dynamic", () => ({
  default: () => function KomponenDinamisTiruan() {
    return null;
  }
}));

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
