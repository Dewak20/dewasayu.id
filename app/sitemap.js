import { getAllArticles } from "../lib/artikel";
import { TAHUN_TERBIT } from "../lib/tahun-terbit";
import { url } from "../lib/situs";

/* Peta situs untuk mesin pencari. Halaman produk (login, daftar, planner)
   sengaja tidak diikutkan: isinya bukan konten yang perlu diindeks, dan
   /planner adalah ruang kerja pribadi. */

export default function sitemap() {
  const sekarang = new Date();

  const statis = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/dewasa-ayu", priority: 0.9, changeFrequency: "weekly" },
    { path: "/dewasa-ayu/apa-itu-dewasa-ayu", priority: 0.8, changeFrequency: "monthly" },
    { path: "/dewasa-ayu/pernikahan", priority: 0.8, changeFrequency: "weekly" },
    { path: "/dewasa-ayu/otonan", priority: 0.7, changeFrequency: "monthly" },
    { path: "/dewasa-ayu/istilah", priority: 0.7, changeFrequency: "monthly" },
    { path: "/dewasa-ayu/artikel", priority: 0.7, changeFrequency: "weekly" },
    { path: "/kalender", priority: 0.9, changeFrequency: "daily" },
    { path: "/kalender/hari-baik", priority: 0.9, changeFrequency: "weekly" },
    { path: "/kalender/otonan", priority: 0.8, changeFrequency: "monthly" }
  ].map((halaman) => ({
    url: url(halaman.path),
    lastModified: sekarang,
    changeFrequency: halaman.changeFrequency,
    priority: halaman.priority
  }));

  const tahun = TAHUN_TERBIT.map((t) => ({
    url: url(`/dewasa-ayu/pernikahan/${t}`),
    lastModified: sekarang,
    changeFrequency: "weekly",
    priority: 0.8
  }));

  const artikel = getAllArticles().map((a) => ({
    url: url(`/dewasa-ayu/artikel/${a.slug}`),
    lastModified: a.date ? new Date(a.date) : sekarang,
    changeFrequency: "monthly",
    priority: 0.6
  }));

  return [...statis, ...tahun, ...artikel];
}
