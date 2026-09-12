import Link from "next/link";
import ContentLayout from "../../../components/ContentLayout";

export const metadata = {
  title: "Otonan Adalah: Arti Ulang Tahun 210 Hari dalam Kalender Bali",
  description:
    "Apa itu otonan, kenapa dirayakan setiap 210 hari (bukan 365 hari), dan kenapa otonan kedua mempelai relevan saat memilih hari baik pernikahan."
};

export default function OtonanPage() {
  return (
    <ContentLayout>
      <div className="da-crumbs">
        <Link href="/dewasa-ayu">Dewasa Ayu</Link>
        <span aria-hidden="true">/</span>
        <strong>Otonan</strong>
      </div>

      <div className="da-hero">
        <span className="eyebrow"><i aria-hidden="true">✦</i> Identitas</span>
        <h1>Otonan: ulang tahun tiap 210 hari.</h1>
        <p className="da-lede">
          Otonan adalah peringatan hari kelahiran menurut kalender pawukon —
          bukan tiap 365 hari seperti ulang tahun Masehi, tapi tiap satu siklus
          pawukon penuh, yaitu <strong>210 hari</strong>.
        </p>
      </div>

      <div className="da-prose">
        <h2>Kenapa 210 hari, bukan 365?</h2>
        <p>
          Karena pawukon adalah siklus 30 wuku × 7 hari = 210 hari, "hari lahir"
          seseorang menurut pawukon (misalnya lahir pada Buda Kliwon, wuku Sinta) akan
          kembali persis ke kombinasi yang sama setiap 210 hari sekali — bukan setiap
          tahun Masehi. Artinya dalam satu tahun Masehi (365 hari), seseorang bisa
          mengalami otonan lebih dari sekali (kurang lebih 1,7 kali).
        </p>

        <h2>Kenapa otonan penting saat memilih hari pernikahan?</h2>
        <p>
          Selain menentukan dewasa ayu secara umum (lihat <Link href="/dewasa-ayu/pernikahan">hari
          baik untuk menikah</Link>), banyak keluarga juga mencocokkan hari yang dipilih
          dengan <strong>otonan kedua mempelai</strong> — misalnya menghindari
          menyelenggarakan acara besar tepat di hari otonan salah satu pihak, atau
          justru memilih hari yang dianggap selaras dengan otonan keduanya.
        </p>
        <p>
          Ini adalah lapisan pertimbangan yang sifatnya personal dan sering luput dari
          kalkulator dewasa ayu generik, karena kalkulator semacam itu biasanya hanya
          menghitung hari baik secara umum tanpa memasukkan tanggal lahir mempelai sama
          sekali.
        </p>

        <h2>Bagaimana cara mengetahui otonan sendiri?</h2>
        <p>
          Otonan dihitung dari kombinasi wuku dan wewaran pada tanggal lahir seseorang
          menurut kalender Bali — bukan dari tanggal Masehi secara langsung. Karena itu,
          untuk mengetahui otonan sendiri biasanya dibutuhkan konversi tanggal lahir
          Masehi ke posisi pawukon terlebih dahulu.
        </p>
      </div>

      <div className="da-callout" style={{ marginTop: 40 }}>
        <span className="mark-icon" aria-hidden="true">☸</span>
        <div>
          <strong>Kalkulator otonan mempelai — segera hadir</strong>
          <p>
            Kami sedang menyiapkan kalkulator yang mencocokkan otonan kedua mempelai
            sekaligus dengan kriteria dewasa ayu pawiwahan, tervalidasi ke sumber
            perhitungan yang sahih. Daftar untuk mendapat kabar saat fitur ini siap.
          </p>
        </div>
      </div>

      <div className="da-hub-grid" style={{ marginTop: 40 }}>
        <Link className="da-hub-card" href="/dewasa-ayu/istilah">
          <span className="tag">Dasar</span>
          <h3>Istilah Wariga: Pawukon, Wewaran, Wuku</h3>
          <p>Kenali dulu wuku dan wewaran yang jadi dasar perhitungan otonan.</p>
          <span className="go">Baca selengkapnya →</span>
        </Link>
        <Link className="da-hub-card" href="/dewasa-ayu/pernikahan">
          <span className="tag">Terapan</span>
          <h3>Hari Baik untuk Menikah</h3>
          <p>Kriteria umum dewasa ayu pawiwahan, di luar pertimbangan otonan.</p>
          <span className="go">Baca selengkapnya →</span>
        </Link>
      </div>

      <div className="da-cta">
        <h2>Hitung otonanmu sekarang.</h2>
        <p>
          Kalkulatornya sudah jalan: masukkan tanggal lahir, dapatkan otonan berikutnya
          beserta wewaran dan wuku tiap tanggalnya.
        </p>
        <Link className="btn btn-gold btn-lg" href="/kalender/otonan">Hitung otonan <i className="arrow" aria-hidden="true">↗</i></Link>
        <p className="da-cta-lain">
          Atau buka <Link href="/kalender">kalender Bali lengkapnya</Link> dan{" "}
          <Link href="/kalender/hari-baik">pencari hari baik</Link>.
        </p>
      </div>
    </ContentLayout>
  );
}
