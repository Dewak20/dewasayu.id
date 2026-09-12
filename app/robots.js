import { url } from "../lib/situs";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Ruang kerja dan halaman auth tidak punya nilai bagi pencari, dan
        // /planner adalah data pribadi pasangan.
        disallow: ["/planner", "/login", "/daftar"]
      }
    ],
    sitemap: url("/sitemap.xml"),
    host: url("/")
  };
}
