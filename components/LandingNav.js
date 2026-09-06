"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Leaf } from "./LandingDoodles";

const links = [
  ["#tentang", "Tentang"],
  ["#adat", "Adat Bali"],
  ["#fitur", "Fitur"],
  ["#cara-kerja", "Cara kerja"]
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`landing-nav${open ? " menu-open" : ""}`}>
      <div className="nav-shell">
        <Link className="brand" href="/" onClick={() => setOpen(false)}>
          <span className="brand-mark"><Leaf /></span>
          <span className="brand-name"><strong>Dewasa Ayu</strong><small>Wedding Planner</small></span>
        </Link>

        <nav className="nav-links" aria-label="Navigasi landing page">
          {links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        </nav>

        <div className="nav-actions">
          <Link className="btn-ghost" href="/login">Masuk</Link>
          <Link className="btn btn-gold" href="/daftar">Daftar <i className="arrow" aria-hidden="true">↗</i></Link>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {open && (
        <div className="nav-menu" id="nav-menu">
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
          <Link className="btn btn-outline" href="/login" onClick={() => setOpen(false)}>Masuk</Link>
          <Link className="btn btn-gold" href="/daftar" onClick={() => setOpen(false)}>
            Daftar <i className="arrow" aria-hidden="true">↗</i>
          </Link>
        </div>
      )}
    </header>
  );
}
