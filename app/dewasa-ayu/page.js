import Link from "next/link";
import ContentLayout from "../../components/ContentLayout";

export const metadata = {
  title: "Dewasa Ayu — Arti, Cara Menghitung, dan Hari Baik dalam Hindu Bali",
  description:
    "Panduan lengkap dewasa ayu: apa itu hari baik menurut kalender Bali, istilah pawukon, wewaran, dan wuku, otonan, hingga cara memilih hari baik untuk pernikahan."
};

const hubLinks = [
  {
    href: "/dewasa-ayu/apa-itu-dewasa-ayu",
    tag: "Dasar",
    title: "Apa itu Dewasa Ayu?",
    desc: "Konsep hari baik dalam Hindu Bali — dari mana asalnya, siapa yang menetapkan, dan kenapa dua sumber kalender dipakai bersamaan."
  },
  {
    href: "/dewasa-ayu/istilah",
    tag: "Glosarium",
    title: "Istilah Wariga: Pawukon, Wewaran, Wuku",
    desc: "Penjelasan tiap istilah yang sering muncul saat orang menyebut 'dewasa ayu' — pawukon, wewaran, wuku, sasih, penanggal, panglong."
  },
  {
    href: "/dewasa-ayu/otonan",
    tag: "Identitas",
    title: "Otonan: Ulang Tahun Menurut Pawukon",
    desc: "Apa itu otonan, cara kerjanya setiap 210 hari, dan kenapa otonan kedua mempelai relevan saat menentukan hari pernikahan."
  },
  {
    href: "/dewasa-ayu/pernikahan",
    tag: "Pernikahan",
    title: "Hari Baik untuk Menikah (Pawiwahan)",
    desc: "Kriteria umum yang dipakai memilih dewasa ayu pawiwahan: wewaran, wuku yang dihindari, tanggal, dan bulan yang dianjurkan."
  },
  {
    href: "/dewasa-ayu/artikel",
    tag: "Artikel",
    title: "Catatan Seputar Dewasa Ayu",
    desc: "Tulisan pendek yang mengurai satu istilah atau kebiasaan pada satu waktu, diperbarui berkala."
  }
];

export default function DewasaAyuHub() {
  return (
    <ContentLayout>
      <div className="da-hero">
        <span className="eyebrow"><i aria-hidden="true">✦</i> Panduan Dewasa Ayu</span>
        <h1>Hari baik, dijelaskan dari akarnya.</h1>
        <p className="da-lede">
          Dewasa ayu adalah hari yang dianggap baik menurut penanggalan Hindu Bali —
          dipakai untuk menikah, membangun rumah, memotong rambut pertama, hingga
          upacara-upacara adat lainnya. Halaman ini kumpulan pengantar sebelum kalian
          memutuskan sendiri, atau berkonsultasi dengan pemangku/sulinggih.
        </p>
      </div>

      <div className="da-prose">
        <p>
          Kalau kalian baru pertama mendengar istilah ini: dewasa ayu bukan sekadar
          "tanggal cantik" seperti 10-10 atau 12-12. Penentuannya mengikuti dua sistem
          kalender yang berjalan berdampingan di Bali — <strong>Pawukon</strong> (siklus
          210 hari) dan <strong>Sasih</strong> (kalender lunar, mirip penanggalan candra).
          Kombinasi keduanya menghasilkan hari-hari tertentu yang dianggap lebih selaras
          untuk aktivitas tertentu, termasuk pernikahan (pawiwahan).
        </p>
      </div>

      <div className="da-hub-grid" style={{ marginTop: 40 }}>
        {hubLinks.map((item) => (
          <Link key={item.href} className="da-hub-card" href={item.href}>
            <span className="tag">{item.tag}</span>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <span className="go">Baca selengkapnya →</span>
          </Link>
        ))}
      </div>

      <div className="da-callout" style={{ marginTop: 48 }}>
        <span className="mark-icon" aria-hidden="true">☸</span>
        <div>
          <strong>Desa, kala, patra.</strong>
          <p>
            Aturan wariga bisa berbeda tipis antar desa, garis keturunan pemangku, dan
            konteks keluarga. Konten di sini adalah pengantar umum untuk bahan diskusi —
            keputusan akhir hari baik pernikahan kalian tetap sebaiknya dikonsultasikan
            ke pemangku atau sulinggih keluarga.
          </p>
        </div>
      </div>

      <div className="da-cta">
        <h2>Sudah dapat gambaran hari baiknya?</h2>
        <p>
          Siapkan sisanya di satu tempat — uang adat, rangkaian acara, vendor, sampai
          daftar tamu — di ruang kerja Dewasa Ayu.
        </p>
        <Link className="btn btn-gold btn-lg" href="/daftar">Mulai siapkan pernikahan <i className="arrow" aria-hidden="true">↗</i></Link>
        <p className="da-cta-lain">
          Mau lihat perhitungannya dulu? Buka{" "}
          <Link href="/kalender">kalender Bali</Link> atau{" "}
          <Link href="/kalender/hari-baik">pencari hari baik</Link>.
        </p>
      </div>
    </ContentLayout>
  );
}
