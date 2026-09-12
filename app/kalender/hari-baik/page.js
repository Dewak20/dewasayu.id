import Link from "next/link";
import ContentLayout from "../../../components/ContentLayout";
import CariHariBaik from "../../../components/CariHariBaik";

export const metadata = {
  title: "Cari Hari Baik — Dewasa Ayu Pawiwahan dan Upacara Lain",
  description:
    "Cari dewasa ayu pada rentang tanggal pilihanmu: pernikahan, yadnya, membangun, usaha, sampai pertanian — lengkap dengan alasan ala dan ayunya.",
  alternates: { canonical: "/kalender/hari-baik" },
  openGraph: {
    type: "article",
    url: "/kalender/hari-baik",
    title: "Cari Hari Baik — Dewasa Ayu Pawiwahan dan Upacara Lain",
    description: "Cari dewasa ayu pada rentang tanggal pilihanmu: pernikahan, yadnya, membangun, usaha, sampai pertanian — lengkap dengan alasan ala dan ayunya."
  }
};

export default function HariBaikPage() {
  return (
    <ContentLayout>
      <div className="da-crumbs">
        <Link href="/dewasa-ayu">Dewasa Ayu</Link>
        <span aria-hidden="true">/</span>
        <Link href="/kalender">Kalender Bali</Link>
        <span aria-hidden="true">/</span>
        <strong>Cari Hari Baik</strong>
      </div>

      <div className="da-hero">
        <span className="eyebrow"><i aria-hidden="true">✦</i> Pencarian</span>
        <h1>Cari hari baik pada rentang tanggalmu.</h1>
        <p className="da-lede">
          Wariga bekerja lebih banyak lewat eliminasi: yang pertama disingkirkan adalah
          hari dengan dewasa ala untuk keperluan itu, baru sesudahnya dilihat mana yang
          punya dukungan. Hasil di bawah mengikuti urutan itu, dan tiap tanggal
          menyebutkan alasannya.
        </p>
      </div>

      <CariHariBaik />

      <div className="da-callout" style={{ marginTop: 44 }}>
        <span className="mark-icon" aria-hidden="true">☸</span>
        <div>
          <strong>Ini bahan diskusi, bukan keputusan akhir.</strong>
          <p>
            Skor di sini hanya menjumlahkan alahing dewasa dari aturan tertulis. Otonan
            kedua mempelai, kebiasaan desa, dan pertimbangan keluarga tidak masuk
            hitungan — dan justru itu yang biasanya menentukan. Bawa hasil ini sebagai
            daftar awal ke pemangku atau sulinggih keluarga.
          </p>
        </div>
      </div>
    </ContentLayout>
  );
}
