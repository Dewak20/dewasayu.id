import Link from "next/link";

export const metadata = {
  title: "Halaman tidak ditemukan — Dewasa Ayu",
  robots: { index: false, follow: true }
};

export default function NotFound() {
  return (
    <div className="landing state-page">
      <main className="stack">
        <section className="panel state-panel">
          <span className="eyebrow"><i>❧</i> 404</span>
          <h1>Halaman yang kamu cari tidak ada.</h1>
          <p>
            Mungkin tautannya sudah berubah atau salah ketik. Beberapa halaman yang
            sering dicari ada di bawah ini.
          </p>
          <div className="actions">
            <Link className="btn btn-gold" href="/">Beranda <i className="arrow">↗</i></Link>
            <Link className="btn btn-outline" href="/kalender">Kalender Bali</Link>
          </div>
          <ul className="state-links">
            <li><Link href="/dewasa-ayu">Apa itu dewasa ayu</Link></li>
            <li><Link href="/kalender/hari-baik">Cari hari baik</Link></li>
            <li><Link href="/kalender/otonan">Hitung otonan</Link></li>
            <li><Link href="/planner">Ruang kerja persiapan</Link></li>
          </ul>
        </section>
      </main>
    </div>
  );
}
