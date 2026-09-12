import { DM_Sans, Marcellus } from "next/font/google";
import "../styles.css";
import "../planner.css";
import "../landing.css";
import "../auth.css";
import "../dewasa-ayu.css";
import "../kalender.css";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "../lib/situs";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-marcellus" });

export const metadata = {
  // metadataBase membuat seluruh URL relatif (openGraph, canonical, gambar)
  // diselesaikan jadi absolut — syarat agar pratinjau tautan bekerja.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dewasa Ayu — Hari Baik & Persiapan Pernikahan Bali",
    template: "%s — Dewasa Ayu"
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["dewasa ayu", "hari baik pernikahan Bali", "wariga", "kalender Bali", "otonan", "pawiwahan", "wedding planner Bali"],
  authors: [{ name: SITE_NAME }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: SITE_NAME,
    title: "Dewasa Ayu — Hari Baik & Persiapan Pernikahan Bali",
    description: SITE_DESCRIPTION
  },
  twitter: {
    card: "summary_large_image",
    title: "Dewasa Ayu — Hari Baik & Persiapan Pernikahan Bali",
    description: SITE_DESCRIPTION
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 }
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#131e18"
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${dmSans.variable} ${marcellus.variable}`}>
      <body>{children}</body>
    </html>
  );
}
