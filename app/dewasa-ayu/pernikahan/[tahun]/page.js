import Link from "next/link";
import { notFound } from "next/navigation";
import ContentLayout from "../../../../components/ContentLayout";
import { cariHariBaik } from "../../../../lib/bali-calendar";
import { TAHUN_TERBIT, adalahTahunTerbit } from "../../../../lib/tahun-terbit";
import { LdRemah } from "../../../../components/DataTerstruktur";

const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// Halaman ini statis: dihitung sekali saat build, bukan tiap permintaan.
export function generateStaticParams() {
  return TAHUN_TERBIT.map((t) => ({ tahun: String(t) }));
}

export async function generateMetadata({ params }) {
  const { tahun } = await params;
  if (!adalahTahunTerbit(tahun)) return {};
  const judul = `Hari Baik Pernikahan ${tahun} Menurut Kalender Bali`;
  const deskripsi =
    `Daftar tanggal pernikahan (pawiwahan) ${tahun} yang tidak berbenturan dengan ` +
    `ala-ayuning dewasa, lengkap dengan wewaran, wuku, dan sasih tiap tanggalnya.`;
  const jalur = `/dewasa-ayu/pernikahan/${tahun}`;
  return {
    title: judul,
    description: deskripsi,
    alternates: { canonical: jalur },
    openGraph: { type: "article", url: jalur, title: judul, description: deskripsi }
  };
}

/** Tanggal bersih penghalang untuk pawiwahan, dikelompokkan per bulan. */
function hariBaikSetahun(tahun) {
  const hasil = cariHariBaik(`${tahun}-01-01`, `${tahun}-12-31`, {
    keperluan: "pernikahan",
    tanpaAla: true
  });
  const perBulan = Array.from({ length: 12 }, () => []);
  for (const h of hasil) perBulan[h.masehi.bulan - 1].push(h);
  // Dalam satu bulan diurutkan menurut tanggal, bukan skor — pembaca menelusuri
  // kalender, bukan peringkat.
  for (const b of perBulan) b.sort((a, c) => a.nomorHari - c.nomorHari);
  return { perBulan, jumlah: hasil.length };
}

export default async function HariBaikTahunPage({ params }) {
  const { tahun } = await params;
  if (!adalahTahunTerbit(tahun)) notFound();
  const { perBulan, jumlah } = hariBaikSetahun(Number(tahun));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Hari Baik Pernikahan ${tahun} Menurut Kalender Bali`,
    inLanguage: "id-ID",
    about: { "@type": "Thing", name: "Dewasa ayu pawiwahan" },
    datePublished: `${tahun}-01-01`
  };

  return (
    <ContentLayout>
      <LdRemah jejak={[{ nama: "Beranda", jalur: "/" }, { nama: "Dewasa Ayu", jalur: "/dewasa-ayu" }, { nama: "Hari Baik Pernikahan", jalur: "/dewasa-ayu/pernikahan" }, { nama: String(tahun), jalur: `/dewasa-ayu/pernikahan/${tahun}` }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="da-crumbs">
        <Link href="/dewasa-ayu">Dewasa Ayu</Link>
        <span aria-hidden="true">/</span>
        <Link href="/dewasa-ayu/pernikahan">Hari Baik Menikah</Link>
        <span aria-hidden="true">/</span>
        <strong>{tahun}</strong>
      </div>

      <div className="da-hero">
        <span className="eyebrow"><i aria-hidden="true">✦</i> Pawiwahan {tahun}</span>
        <h1>Hari baik pernikahan {tahun} menurut kalender Bali.</h1>
        <p className="da-lede">
          {jumlah} tanggal di sepanjang {tahun} yang tidak berbenturan dengan satu pun
          ala-ayuning dewasa yang merugikan pawiwahan. Daftar ini titik awal untuk
          dibawa ke keluarga dan pemangku — bukan keputusan akhir.
        </p>
      </div>

      <div className="da-callout">
        <span className="mark-icon" aria-hidden="true">☸</span>
        <div>
          <strong>Desa, kala, patra.</strong>
          <p>
            Daftar ini hanya menyaring ala-ayuning dewasa yang tertulis. Otonan kedua
            mempelai, kebiasaan desa, dan pertimbangan keluarga belum masuk hitungan —
            dan justru itu yang biasanya menentukan. Untuk memasukkan otonan, pakai{" "}
            <Link href="/kalender/hari-baik">pencari hari baik</Link>.
          </p>
        </div>
      </div>

      <div className="hb-tahun">
        {perBulan.map((hari, i) => (
          <section className="hb-bulan" key={i}>
            <h2>{NAMA_BULAN[i]} <span>{hari.length} tanggal</span></h2>
            {hari.length === 0 ? (
              <p className="hb-kosong">
                Tidak ada tanggal yang bersih dari penghalang pada bulan ini.
              </p>
            ) : (
              <ul>
                {hari.map((h) => (
                  <li key={h.tanggal}>
                    <Link href={`/kalender?tanggal=${h.tanggal}`}>
                      <strong>{h.masehi.hari}</strong>
                      <span className="hb-wew">
                        {h.wewaran.saptawara} {h.wewaran.pancawara} · {h.wuku.nama}
                      </span>
                      <span className="hb-sasih">
                        {h.sasih?.label} sasih {h.sasih?.nama}
                      </span>
                      <span className="hb-kriteria">
                        {h.nilai.kriteria.jumlahCocok}/3 kriteria umum
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="da-prose" style={{ marginTop: 40 }}>
        <h2>Cara daftar ini disusun</h2>
        <p>
          Tiap tanggal di {tahun} dihitung ulang dengan mesin kalender Bali milik situs
          ini: pawukon, wewaran, sasih, lalu dicocokkan dengan 220 aturan ala-ayuning
          dewasa. Tanggal yang memuat satu saja dewasa yang merugikan pawiwahan
          dikeluarkan. Sisanya ditampilkan apa adanya, tanpa diurutkan menurut skor,
          supaya tidak terbaca sebagai peringkat.
        </p>
        <p>
          Angka &ldquo;kriteria umum&rdquo; menunjuk tiga anjuran yang lazim dipakai untuk
          pawiwahan — saptawara, penanggal, dan sasih — yang dijelaskan di{" "}
          <Link href="/dewasa-ayu/pernikahan">halaman induknya</Link>. Angka rendah tidak
          berarti tanggalnya buruk; artinya tanggal itu lolos saringan dewasa tapi tidak
          memenuhi anjuran umum tersebut.
        </p>
      </div>

      <div className="da-tahun-tautan" style={{ marginTop: 28 }}>
        {TAHUN_TERBIT.filter((t) => String(t) !== String(tahun)).map((t) => (
          <Link key={t} href={`/dewasa-ayu/pernikahan/${t}`}>Hari baik {t}</Link>
        ))}
        <Link href="/kalender">Kalender Bali lengkap</Link>
      </div>
    </ContentLayout>
  );
}
