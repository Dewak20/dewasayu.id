/* Satu sumber kebenaran untuk identitas situs.
   Dipakai metadata layout, sitemap, robots, dan JSON-LD supaya URL kanonis
   tidak pernah berbeda antar berkas. */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://dewasayu.id").replace(/\/$/, "");

export const SITE_NAME = "Dewasa Ayu";

export const SITE_DESCRIPTION =
  "Cari dewasa ayu (hari baik) pernikahan Bali berdasarkan wariga, lalu kelola anggaran, vendor, tamu, dan seluruh rangkaian acara dalam satu ruang kerja.";

export const url = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
