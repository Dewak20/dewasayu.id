"use client";

import Link from "next/link";
import { Leaf } from "./LandingDoodles";

export default function ContentLayout({ children }) {
  return (
    <div className="landing content-page">
      <header className="landing-nav">
        <div className="nav-shell">
          <Link className="brand" href="/">
            <span className="brand-mark"><Leaf /></span>
            <span className="brand-name"><strong>Dewasa Ayu</strong><small>Wedding Planner</small></span>
          </Link>
          <nav className="nav-links" aria-label="Navigasi Dewasa Ayu">
            <Link href="/dewasa-ayu">Dewasa Ayu</Link>
            <Link href="/kalender">Kalender Bali</Link>
            <Link href="/kalender/hari-baik">Cari Hari Baik</Link>
            <Link href="/dewasa-ayu/otonan">Otonan</Link>
            <Link href="/dewasa-ayu/artikel">Artikel</Link>
          </nav>
          <div className="nav-actions">
            <Link className="btn-ghost" href="/login">Masuk</Link>
            <Link className="btn btn-gold" href="/daftar">Daftar <i className="arrow" aria-hidden="true">↗</i></Link>
          </div>
        </div>
      </header>

      <main className="da-main">{children}</main>

      <footer className="foot">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link className="brand" href="/">
              <span className="brand-mark"><Leaf /></span>
              <span className="brand-name"><strong>Dewasa Ayu</strong><small>Wedding Planner</small></span>
            </Link>
            <p>Ruang persiapan pernikahan yang tumbuh dari rencana nyata—rapi, hangat, dan selalu dekat.</p>
          </div>
          <div>
            <strong>Dewasa Ayu</strong>
            <Link href="/dewasa-ayu/apa-itu-dewasa-ayu">Apa itu dewasa ayu</Link>
            <Link href="/dewasa-ayu/istilah">Istilah wariga</Link>
            <Link href="/dewasa-ayu/otonan">Otonan</Link>
            <Link href="/dewasa-ayu/pernikahan">Hari baik menikah</Link>
            <Link href="/kalender">Kalender Bali</Link>
            <Link href="/dewasa-ayu/artikel">Artikel</Link>
          </div>
          <div><strong>Mulai</strong><Link href="/daftar">Daftar</Link><Link href="/login">Masuk</Link><Link href="/planner">Planner</Link></div>
        </div>
        <div className="wordmark" aria-hidden="true">Dewasa Ayu</div>
        <div className="foot-bottom">
          <span>© 2026 Dewasa Ayu</span>
          <span>Persiapan hari bahagia, tanpa yang terlupa.</span>
        </div>
      </footer>
    </div>
  );
}
