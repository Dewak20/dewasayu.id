import { DM_Sans, Marcellus } from "next/font/google";
import "../styles.css";
import "../planner.css";
import "../landing.css";
import "../auth.css";
import "../dewasa-ayu.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-marcellus" });

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
    <html lang="id" className={`${dmSans.variable} ${marcellus.variable}`}>
      <body>{children}</body>
    </html>
  );
}
