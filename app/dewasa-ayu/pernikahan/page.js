import Link from "next/link";
import { TAHUN_TERBIT } from "../../../lib/tahun-terbit";
import ContentLayout from "../../../components/ContentLayout";

export const metadata = {
  title: "Dewasa Ayu Pernikahan: Cara Memilih Hari Baik Menikah di Bali",
  description:
    "Kriteria umum yang dipakai memilih dewasa ayu pawiwahan (hari baik menikah) menurut wariga Bali — wewaran, wuku yang dihindari, tanggal, dan bulan yang dianjurkan."
};

const criteria = [
  { status: "Baik", tone: "good", text: "Saptawara Soma (Senin), Buda (Rabu), Wraspati (Kamis), dan Sukra (Jumat) umum disebut sebagai hari yang dianjurkan untuk pawiwahan." },
  { status: "Hindari", tone: "avoid", text: "Wuku yang termasuk kelompok Rangda Tiga (di antaranya Wariga, Warigadean, Julungwangi, Pujut, Pahang, Menail, Prangbakat) umumnya dihindari untuk acara pernikahan." },
  { status: "Hindari", tone: "avoid", text: "Wuku Uncal Balung juga umumnya masuk daftar yang dihindari untuk pawiwahan." },
  { status: "Baik", tone: "good", text: "Penanggal (tanggal pada paruh terang bulan) di posisi 1, 2, 10, atau 13 sering disebut sebagai posisi yang dianjurkan." },
  { status: "Baik", tone: "good", text: "Sasih (bulan) ke-3, ke-4, ke-5, ke-7, dan ke-10 dalam kalender Bali umum disebut sebagai bulan yang dianjurkan untuk upacara manusa yadnya, termasuk pernikahan." }
];

export default function PernikahanPage() {
  return (
    <ContentLayout>
      <div className="da-crumbs">
        <Link href="/dewasa-ayu">Dewasa Ayu</Link>
        <span aria-hidden="true">/</span>
        <strong>Hari Baik untuk Menikah</strong>
      </div>

      <div className="da-hero">
        <span className="eyebrow"><i aria-hidden="true">✦</i> Pernikahan</span>
        <h1>Dewasa ayu pawiwahan: hari baik untuk menikah.</h1>
        <p className="da-lede">
          Pawiwahan (upacara pernikahan) punya aturan wariga tersendiri, terpisah dari
          dewasa ayu untuk acara lain seperti potong rambut atau mendirikan bangunan.
          Berikut kriteria umum yang sering dijadikan acuan. Daftar tanggalnya sendiri
          dihitung ulang tiap tahun dan diterbitkan per tahun — tautannya ada di bawah.
        </p>
      </div>

      <div className="da-prose">
        <h2>Kriteria umum yang sering dipakai</h2>
        <p>
          Kriteria di bawah ini merangkum apa yang umum disebutkan dalam literatur
          wariga Bali yang beredar luas. Bobot dan pengecualiannya bisa berbeda antar
          desa dan garis keturunan pemangku — anggap ini sebagai kerangka awal, bukan
          keputusan akhir.
        </p>
      </div>

      <div className="da-criteria" style={{ marginTop: 22 }}>
        {criteria.map((row, i) => (
          <div className={`da-criteria-row ${row.tone}`} key={i}>
            <span className="status">{row.status}</span>
            <p>{row.text}</p>
          </div>
        ))}
      </div>

      <div className="da-prose" style={{ marginTop: 40 }}>
        <h2>Daftar tanggal per tahun</h2>
        <p>
          Karena wuku, wewaran, dan sasih berjalan pada siklusnya masing-masing dan
          tidak selaras dengan kalender Masehi, satu tanggal Masehi (misalnya 12
          September) jatuh pada kombinasi yang berbeda setiap tahun — jadi daftarnya
          harus dihitung ulang per tahun, bukan disalin. Mesin perhitungan kami kini
          sudah tervalidasi terhadap kalenderbali.org (pawukon 1970–2100, dua tahun
          penuh data harian, dan seluruh korpus 220 aturan ala-ayuning dewasa), jadi
          daftarnya sudah bisa diterbitkan:
        </p>
        <p className="da-tahun-tautan">
          {TAHUN_TERBIT.map((t) => (
            <Link key={t} href={`/dewasa-ayu/pernikahan/${t}`}>Hari baik {t}</Link>
          ))}
        </p>
        <p>
          Untuk kebutuhan mendesak, cara paling aman tetap berkonsultasi langsung
          dengan pemangku atau sulinggih keluarga, yang bisa sekaligus mempertimbangkan
          <Link href="/dewasa-ayu/otonan"> otonan kedua mempelai</Link> dan konteks
          keluarga yang tidak tertulis di kalender cetak.
        </p>
      </div>

      <div className="da-callout" style={{ marginTop: 40 }}>
        <span className="mark-icon" aria-hidden="true">☸</span>
        <div>
          <strong>Desa, kala, patra.</strong>
          <p>
            Kriteria di halaman ini adalah rangkuman umum untuk bahan diskusi awal.
            Keputusan akhir hari pernikahan sebaiknya tetap dikonsultasikan ke pemangku
            atau sulinggih keluarga, yang memahami konteks desa dan keluarga kalian
            secara langsung.
          </p>
        </div>
      </div>

      <div className="da-hub-grid" style={{ marginTop: 40 }}>
        <Link className="da-hub-card" href="/dewasa-ayu/otonan">
          <span className="tag">Terkait</span>
          <h3>Otonan Kedua Mempelai</h3>
          <p>Lapisan pertimbangan personal yang sering dilewatkan kalkulator dewasa ayu generik.</p>
          <span className="go">Baca selengkapnya →</span>
        </Link>
        <Link className="da-hub-card" href="/dewasa-ayu/istilah">
          <span className="tag">Dasar</span>
          <h3>Istilah Wariga</h3>
          <p>Belum familiar dengan wuku, wewaran, atau sasih? Mulai dari sini.</p>
          <span className="go">Baca selengkapnya →</span>
        </Link>
      </div>

      <div className="da-cta">
        <h2>Sambil menunggu hari baik dipastikan, mulai siapkan yang lain.</h2>
        <p>Anggaran, uang adat, rangkaian acara, vendor, dan daftar tamu — dalam satu ruang kerja.</p>
        <Link className="btn btn-gold btn-lg" href="/daftar">Mulai siapkan pernikahan <i className="arrow" aria-hidden="true">↗</i></Link>
        <p className="da-cta-lain">
          Sudah punya rentang tanggalnya? Coba{" "}
          <Link href="/kalender/hari-baik">pencari hari baik</Link> — bisa sekaligus
          memperhitungkan otonan kedua mempelai.
        </p>
      </div>
    </ContentLayout>
  );
}
