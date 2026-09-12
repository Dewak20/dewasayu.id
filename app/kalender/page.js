import Link from "next/link";
import ContentLayout from "../../components/ContentLayout";
import KalenderBali from "../../components/KalenderBali";
import { hariBali, RENTANG_DIDUKUNG } from "../../lib/bali-calendar";

const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const JUDUL_UMUM = "Kalender Bali — Wewaran, Wuku, Sasih, dan Ala-Ayuning Dewasa";
const DESKRIPSI_UMUM =
  "Kalender Bali lengkap: wewaran (ekawara sampai dasawara), wuku, penanggal/pangelong, " +
  "sasih, purnama-tilem, dan ala-ayuning dewasa untuk setiap tanggal.";

/** Tanggal yang valid dan ada di dalam rentang sasih; selain itu null. */
function tanggalSah(t) {
  if (typeof t !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return null;
  if (d < RENTANG_DIDUKUNG.mulai || d > RENTANG_DIDUKUNG.selesai) return null;
  return t;
}

// Judul dan deskripsi ikut tanggal yang dibuka, supaya tautan yang dibagikan
// (dan hasil pencarian) menyebut tanggalnya, bukan judul generik yang sama semua.
export async function generateMetadata({ searchParams }) {
  const q = await searchParams;
  const t = tanggalSah(q?.tanggal);
  if (!t) return { title: JUDUL_UMUM, description: DESKRIPSI_UMUM };

  const h = hariBali(t);
  const tanggal = `${h.masehi.hari} ${NAMA_BULAN[h.masehi.bulan - 1]} ${h.masehi.tahun}`;
  const wew = `${h.wewaran.saptawara} ${h.wewaran.pancawara} wuku ${h.wuku.nama}`;
  const rerainan = h.rerainan.map((r) => r.nama).join(", ");
  return {
    title: `${tanggal} dalam Kalender Bali — ${wew}`,
    description:
      `${tanggal}: ${wew}, ${h.sasih.label} sasih ${h.sasih.nama}, Saka ${h.saka}.` +
      (rerainan ? ` Rerainan: ${rerainan}.` : "") +
      ` ${h.dewasa.length} ala-ayuning dewasa berlaku pada hari ini.`
  };
}

export default async function KalenderPage({ searchParams }) {
  const q = await searchParams;
  const awal = typeof q?.tanggal === "string" ? q.tanggal : null;
  // ?bulan=YYYY-MM menentukan bulan yang tampil, terpisah dari tanggal terpilih —
  // keduanya ikut ke URL supaya tampilan apa pun bisa dibagikan sebagai tautan.
  const bulanAwal = typeof q?.bulan === "string" ? q.bulan : null;
  const sah = tanggalSah(awal);
  const h = sah ? hariBali(sah) : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Kalender Bali Dewasa Ayu",
    applicationCategory: "ReferenceApplication",
    inLanguage: "id-ID",
    description: DESKRIPSI_UMUM,
    ...(h && {
      about: {
        "@type": "Event",
        name: `${h.wewaran.saptawara} ${h.wewaran.pancawara} wuku ${h.wuku.nama}`,
        startDate: h.tanggal,
        endDate: h.tanggal,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode"
      }
    })
  };

  return (
    <ContentLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="da-crumbs">
        <Link href="/dewasa-ayu">Dewasa Ayu</Link>
        <span aria-hidden="true">/</span>
        <strong>Kalender Bali</strong>
      </div>

      <div className="da-hero">
        <span className="eyebrow"><i aria-hidden="true">✦</i> Kalender</span>
        <h1>Kalender Bali, lengkap sampai ala-ayuning dewasa.</h1>
        <p className="da-lede">
          Pilih satu tanggal untuk melihat seluruh perhitungannya — sepuluh wewaran,
          wuku dan bhataranya, penanggal/pangelong, sasih, sampai daftar dewasa yang
          berlaku beserta alahing dewasanya.
        </p>
      </div>

      <div className="kb-alat">
        <Link className="btn btn-gold" href="/kalender/hari-baik">Cari hari baik ↗</Link>
        <Link className="btn-ghost" href="/kalender/otonan">Hitung otonan</Link>
      </div>

      <KalenderBali awal={awal} bulanAwal={bulanAwal} />

      <div className="da-callout" style={{ marginTop: 44 }}>
        <span className="mark-icon" aria-hidden="true">☸</span>
        <div>
          <strong>Rentang dan rujukan.</strong>
          <p>
            Perhitungan pawukon dan wewaran berlaku untuk tanggal berapa pun, sementara
            sasih (penanggal, pangelong, purnama, tilem) memakai tabel 1970–2100 yang
            disusun agar sama persis dengan kalenderbali.org. Aturan ala-ayuning dewasa
            juga mengikuti rujukan yang sama. Untuk keputusan upacara, tetap
            konsultasikan ke pemangku atau sulinggih keluarga.
          </p>
          <p>
            Aturan wariga adalah pengetahuan adat milik bersama, tapi korpus
            terstrukturnya — 220 ala-ayuning dewasa beserta pola dan bobotnya, anchor
            purnama-tilem 1970–2100, dan teks tafsir tiap wara — disusun dan diterbitkan
            oleh{" "}
            <a href="https://kalenderbali.org/" rel="noopener noreferrer" target="_blank">
              Kalender Bali Digital
            </a>{" "}
            (I Wayan Nuarsa, Universitas Udayana). Seluruh perhitungan di sini divalidasi
            terhadap keluaran mereka.
          </p>
        </div>
      </div>
    </ContentLayout>
  );
}
