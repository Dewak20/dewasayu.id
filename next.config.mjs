/** @type {import('next').NextConfig} */

// Header keamanan dasar. Tidak ada CSP di sini karena situs masih memuat
// font Google dan skrip inline Next — CSP menyusul bersama backend Wave 4,
// supaya tidak memblokir sesuatu tanpa cara mengujinya lebih dulu.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" }
];

const nextConfig = {
  reactStrictMode: true,

  images: {
    // Aset dari workbook berupa PNG 500–700 kB. AVIF/WebP memangkasnya
    // drastis tanpa mengubah berkas sumbernya.
    formats: ["image/avif", "image/webp"],
    // Cache hasil optimasi 30 hari; gambarnya tidak pernah berubah.
    minimumCacheTTL: 2592000
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  }
};

export default nextConfig;
