import Link from "next/link";
import ContentLayout from "../../../components/ContentLayout";

export const metadata = {
  title: "Istilah Wariga: Arti Pawukon, Wewaran, Wuku, Sasih | Dewasa Ayu",
  description:
    "Glosarium istilah wariga Bali — pawukon, wewaran (ekawara sampai dasawara), wuku, sasih, penanggal, dan panglong — dijelaskan singkat dan mudah dipahami."
};

const terms = [
  {
    title: "Pawukon",
    desc: "Siklus tetap 210 hari yang terbagi menjadi 30 wuku, masing-masing 7 hari. Tidak mengikuti bulan atau matahari — murni siklus yang berulang terus-menerus."
  },
  {
    title: "Wuku",
    desc: "Satu \"minggu\" dalam siklus pawukon. Ada 30 wuku dengan nama masing-masing (Sinta, Landep, Ukir, ... Watugunung), dan tiap wuku punya karakter/wataknya sendiri."
  },
  {
    title: "Wewaran",
    desc: "Sebutan untuk kumpulan \"pekan\" yang berjalan paralel dalam pawukon — mulai dari Ekawara (siklus 1 hari) sampai Dasawara (siklus 10 hari). Yang paling sering dipakai orang awam adalah Triwara, Pancawara, dan Saptawara."
  },
  {
    title: "Saptawara",
    desc: "Wewaran 7 hari — persis seperti nama hari Masehi (Redite/Minggu, Soma/Senin, Anggara/Selasa, Buda/Rabu, Wraspati/Kamis, Sukra/Jumat, Saniscara/Sabtu)."
  },
  {
    title: "Pancawara (Pasaran)",
    desc: "Wewaran 5 hari: Umanis, Paing, Pon, Wage, Kliwon. Dikombinasikan dengan Saptawara menghasilkan nama hari lengkap, misalnya \"Anggara Umanis\"."
  },
  {
    title: "Triwara",
    desc: "Wewaran 3 hari: Pasah, Beteng, Kajeng. Kombinasi \"Kajeng Kliwon\" (Kajeng bertemu Kliwon) adalah salah satu yang paling dikenal luas di Bali."
  },
  {
    title: "Sasih",
    desc: "Bulan dalam kalender lunar Bali, ada 12 dalam setahun (Kasa sampai Sadha/Kasanga, penomoran bervariasi antar daerah). Dipakai untuk menentukan bulan yang dianggap baik untuk acara tertentu."
  },
  {
    title: "Penanggal & Panglong",
    desc: "Penanggal adalah paruh terang bulan (menuju purnama), panglong adalah paruh gelap (menuju tilem/bulan mati). Bersama nomor tanggalnya (penanggal 1-15, panglong 1-15), ini menunjukkan posisi hari dalam siklus lunar."
  },
  {
    title: "Purnama & Tilem",
    desc: "Purnama adalah hari bulan penuh, tilem adalah hari bulan mati (gelap total). Keduanya dianggap hari suci dan sering jadi acuan untuk upacara persembahyangan."
  },
  {
    title: "Dewasa Ayu & Dewasa Ala",
    desc: "Dewasa ayu adalah hari baik, dewasa ala adalah hari yang sebaiknya dihindari untuk aktivitas tertentu — hasil dari mencocokkan seluruh elemen wariga di atas."
  }
];

export default function IstilahPage() {
  return (
    <ContentLayout>
      <div className="da-crumbs">
        <Link href="/dewasa-ayu">Dewasa Ayu</Link>
        <span aria-hidden="true">/</span>
        <strong>Istilah Wariga</strong>
      </div>

      <div className="da-hero">
        <span className="eyebrow"><i aria-hidden="true">✦</i> Glosarium</span>
        <h1>Istilah wariga, satu per satu.</h1>
        <p className="da-lede">
          Kalau kalian pernah dengar orang tua menyebut "Kajeng Kliwon" atau "wuku
          Wariga" dan bingung artinya, halaman ini kumpulan istilah dasarnya —
          disusun dari yang paling sering dipakai sampai yang lebih teknis.
        </p>
      </div>

      <div className="da-term-grid">
        {terms.map((term) => (
          <div className="da-term-card" key={term.title}>
            <strong>{term.title}</strong>
            <p>{term.desc}</p>
          </div>
        ))}
      </div>

      <div className="da-prose" style={{ marginTop: 44 }}>
        <h2>Bagaimana istilah-istilah ini digabungkan?</h2>
        <p>
          Setiap hari punya "identitas lengkap" yang tersusun dari kombinasi wuku +
          Saptawara + Pancawara (+ Triwara, dst.), ditambah posisi penanggal/panglong
          pada sasih yang sedang berjalan. Misalnya sebuah tanggal bisa disebutkan
          sebagai <em>"Anggara Umanis, Kajeng, wuku Uye"</em> — artinya hari itu jatuh
          pada Saptawara Anggara (Selasa), Pancawara Umanis, Triwara Kajeng, dan berada
          dalam wuku Uye.
        </p>
        <p>
          Dari kombinasi itulah dicocokkan aturan-aturan tambahan (wuku mana yang
          dihindari untuk acara tertentu, wewaran mana yang dianjurkan) untuk sampai
          pada kesimpulan dewasa ayu atau dewasa ala.
        </p>
      </div>

      <div className="da-hub-grid" style={{ marginTop: 40 }}>
        <Link className="da-hub-card" href="/dewasa-ayu/otonan">
          <span className="tag">Lanjut baca</span>
          <h3>Otonan: Ulang Tahun Menurut Pawukon</h3>
          <p>Bagaimana wuku dan wewaran dipakai untuk menghitung otonan kelahiran seseorang.</p>
          <span className="go">Baca selengkapnya →</span>
        </Link>
        <Link className="da-hub-card" href="/dewasa-ayu/pernikahan">
          <span className="tag">Terapan</span>
          <h3>Hari Baik untuk Menikah</h3>
          <p>Kriteria umum yang memakai istilah-istilah di atas untuk menentukan dewasa ayu pawiwahan.</p>
          <span className="go">Baca selengkapnya →</span>
        </Link>
      </div>

      <div className="da-cta">
        <h2>Sudah cukup paham istilahnya?</h2>
        <p>Lanjut siapkan pernikahan kalian — anggaran, vendor, rangkaian acara — dalam satu ruang kerja.</p>
        <Link className="btn btn-gold btn-lg" href="/daftar">Mulai siapkan pernikahan <i className="arrow" aria-hidden="true">↗</i></Link>
      </div>
    </ContentLayout>
  );
}
