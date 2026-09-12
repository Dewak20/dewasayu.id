import Link from "next/link";
import ContentLayout from "../../../components/ContentLayout";
import { LdRemah } from "../../../components/DataTerstruktur";

export const metadata = {
  title: "Apa itu Dewasa Ayu? Pengertian Hari Baik dalam Hindu Bali",
  description:
    "Penjelasan lengkap apa itu dewasa ayu, dua sistem kalender yang membentuknya (pawukon dan sasih), dan siapa yang berwenang menetapkannya.",
  alternates: { canonical: "/dewasa-ayu/apa-itu-dewasa-ayu" },
  openGraph: {
    type: "article",
    url: "/dewasa-ayu/apa-itu-dewasa-ayu",
    title: "Apa itu Dewasa Ayu? Pengertian Hari Baik dalam Hindu Bali",
    description: "Penjelasan lengkap apa itu dewasa ayu, dua sistem kalender yang membentuknya (pawukon dan sasih), dan siapa yang berwenang menetapkannya."
  }
};

export default function ApaItuDewasaAyu() {
  return (
    <ContentLayout>
      <LdRemah jejak={[{ nama: "Beranda", jalur: "/" }, { nama: "Dewasa Ayu", jalur: "/dewasa-ayu" }, { nama: "Apa itu Dewasa Ayu", jalur: "/dewasa-ayu/apa-itu-dewasa-ayu" }]} />
      <div className="da-crumbs">
        <Link href="/dewasa-ayu">Dewasa Ayu</Link>
        <span aria-hidden="true">/</span>
        <strong>Apa itu Dewasa Ayu</strong>
      </div>

      <div className="da-hero">
        <span className="eyebrow"><i aria-hidden="true">✦</i> Dasar</span>
        <h1>Apa itu Dewasa Ayu?</h1>
        <p className="da-lede">
          Dewasa ayu, secara harfiah, berarti "waktu/hari yang baik". Dalam praktik Hindu
          Bali, istilah ini merujuk pada hari-hari tertentu yang dianggap membawa energi
          selaras untuk memulai suatu pekerjaan atau upacara — lawannya adalah dewasa ala
          (hari yang sebaiknya dihindari).
        </p>
      </div>

      <div className="da-prose">
        <h2>Dua kalender, satu keputusan</h2>
        <p>
          Yang membuat perhitungan dewasa ayu terasa rumit bagi pemula adalah karena ada
          <strong> dua sistem kalender berbeda</strong> yang dipakai bersamaan:
        </p>
        <ul>
          <li>
            <strong>Pawukon</strong> — siklus tetap 210 hari, tersusun dari 30 wuku yang
            masing-masing berisi 7 hari. Di dalamnya ada beberapa lapis "pekan" yang
            berjalan paralel (disebut wewaran), mulai dari pekan 1 hari sampai 10 hari.
            Sistem ini tidak berkaitan dengan bulan atau matahari — murni siklus berulang.
          </li>
          <li>
            <strong>Sasih</strong> — kalender lunar, mirip penanggalan candra pada
            umumnya, terbagi menjadi 12 bulan dengan penanggal (paruh terang, menuju bulan
            purnama) dan panglong (paruh gelap, menuju bulan mati/tilem).
          </li>
        </ul>
        <p>
          Hari baik biasanya ditentukan dengan mencocokkan posisi suatu tanggal pada
          <em> kedua</em> sistem ini sekaligus, ditambah aturan tambahan yang berbeda-beda
          tergantung jenis acaranya (pernikahan punya aturan sendiri, berbeda dari
          misalnya potong rambut bayi atau mendirikan bangunan).
        </p>

        <h2>Siapa yang menetapkan?</h2>
        <p>
          Secara tradisional, penentuan dewasa ayu untuk acara penting seperti pernikahan
          dilakukan oleh <strong>pemangku atau sulinggih</strong> keluarga, karena mereka
          memahami konteks tambahan yang tidak selalu tertulis di kalender cetak —
          misalnya kecocokan dengan otonan mempelai, kondisi keluarga, atau kebiasaan
          desa setempat (lihat prinsip <em>desa, kala, patra</em>: aturan menyesuaikan
          tempat, waktu, dan keadaan).
        </p>
        <p>
          Kalender cetak dan aplikasi (termasuk yang akan hadir di sini) berguna sebagai
          <strong> bahan diskusi awal</strong> sebelum berkonsultasi — bukan pengganti
          keputusan pemangku.
        </p>

        <h2>Dewasa ayu vs. tanggal "populer"</h2>
        <p>
          Berbeda dari tren memilih tanggal simetris (10-10, 12-12) yang populer secara
          global, dewasa ayu tidak mengikuti kalender Masehi sama sekali. Sebuah tanggal
          Masehi bisa jatuh pada wuku dan wewaran yang berbeda setiap tahunnya, sehingga
          "hari baik" untuk menikah bisa saja 3 Agustus di satu tahun, dan tanggal yang
          sama sekali berbeda di tahun berikutnya.
        </p>
      </div>

      <div className="da-hub-grid" style={{ marginTop: 40 }}>
        <Link className="da-hub-card" href="/dewasa-ayu/istilah">
          <span className="tag">Lanjut baca</span>
          <h3>Istilah Wariga: Pawukon, Wewaran, Wuku</h3>
          <p>Kenali tiap istilah yang dipakai di atas satu per satu, lengkap dengan contohnya.</p>
          <span className="go">Baca selengkapnya →</span>
        </Link>
        <Link className="da-hub-card" href="/dewasa-ayu/pernikahan">
          <span className="tag">Terapan</span>
          <h3>Hari Baik untuk Menikah</h3>
          <p>Kriteria umum yang dipakai memilih dewasa ayu khusus pawiwahan.</p>
          <span className="go">Baca selengkapnya →</span>
        </Link>
      </div>

      <div className="da-cta">
        <h2>Ingin dibantu menghitungkan?</h2>
        <p>Kalkulator dewasa ayu untuk pernikahan sedang kami siapkan bersama sumber yang tervalidasi. Daftar dulu untuk siapkan hal lain sambil menunggu.</p>
        <Link className="btn btn-gold btn-lg" href="/daftar">Daftar sekarang <i className="arrow" aria-hidden="true">↗</i></Link>
      </div>
    </ContentLayout>
  );
}
