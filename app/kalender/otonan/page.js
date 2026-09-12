import Link from "next/link";
import ContentLayout from "../../../components/ContentLayout";
import KalkulatorOtonan from "../../../components/KalkulatorOtonan";

export const metadata = {
  title: "Kalkulator Otonan — Hitung Otonan dari Tanggal Lahir",
  description:
    "Hitung otonan dari tanggal lahir: wewaran kelahiran (saptawara, pancawara, wuku) dan tanggal otonan berikutnya yang berulang tiap 210 hari."
};

export default function OtonanPage() {
  return (
    <ContentLayout>
      <div className="da-crumbs">
        <Link href="/dewasa-ayu">Dewasa Ayu</Link>
        <span aria-hidden="true">/</span>
        <Link href="/kalender">Kalender Bali</Link>
        <span aria-hidden="true">/</span>
        <strong>Otonan</strong>
      </div>

      <div className="da-hero">
        <span className="eyebrow"><i aria-hidden="true">✦</i> Otonan</span>
        <h1>Hitung otonan dari tanggal lahir.</h1>
        <p className="da-lede">
          Otonan jatuh saat kombinasi saptawara, pancawara, dan wuku kelahiran bertemu
          kembali — setiap 210 hari sekali. Masukkan tanggal lahir untuk melihat
          wewaran kelahiran dan enam otonan berikutnya.
        </p>
      </div>

      <KalkulatorOtonan />

      <div className="da-prose" style={{ marginTop: 44 }}>
        <h2>Kenapa 210 hari?</h2>
        <p>
          Pawukon terdiri dari 30 wuku, masing-masing 7 hari, jadi satu putaran penuh
          210 hari. Karena saptawara (7) dan pancawara (5) juga berulang di dalamnya,
          kombinasi ketiganya baru bertemu lagi setelah satu putaran penuh. Penjelasan
          lebih panjang ada di <Link href="/dewasa-ayu/otonan">halaman otonan</Link>.
        </p>
      </div>
    </ContentLayout>
  );
}
