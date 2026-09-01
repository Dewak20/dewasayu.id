import "../styles.css";
import "../planner.css";
import "../landing.css";
import "../auth.css";

export const metadata = {
  title: "Dewasa Ayu — Persiapan Pernikahan dalam Satu Tempat",
  description: "Kelola anggaran, checklist, vendor, tamu, prewedding, seserahan, dan dokumen pernikahan dalam satu ruang kerja yang tenang."
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f1ea"
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
