"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Rays, Rings, Sprig, Wave, Leaf, Frangipani, IconCalendar, IconCompare, IconCheck, IconHeart } from "./LandingDoodles";

/* Halaman auth memakai bahasa desain landing page: kanvas hijau tua,
   panel membulat besar, blok aksen ink/emas, tombol pill, dan doodle
   botani. Kelas .landing sengaja dipasang di root supaya seluruh token
   warna, tipografi Marcellus, dan komponen .btn/.eyebrow ikut terpakai. */

const EyeIcon = ({ crossed = false }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M2.5 12s3.4-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.4 5.5-9.5 5.5S2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.5" />
    {crossed && <path d="m4 4 16 16" />}
  </svg>
);

const highlights = [
  { icon: Frangipani, title: "Uang adat tercatat", text: "Sesari, dana punia, dan peturunan banjar lengkap dengan statusnya." },
  { icon: IconCalendar, title: "Seluruh rangkaian", text: "Tiap acara punya rundown, lokasi, dan penanggung jawab sendiri." },
  { icon: IconHeart, title: "Satu ruang berdua", text: "Anggaran, vendor, tamu, dan dokumen tidak lagi tercecer." }
];

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const password = form.get("password");

    if (!isLogin && password !== form.get("confirmPassword")) {
      setError("Konfirmasi kata sandi belum sama. Silakan periksa kembali.");
      return;
    }

    setSubmitting(true);
    const profile = {
      name: isLogin ? "Ayu & Dewa" : form.get("name"),
      email: form.get("email")
    };
    window.localStorage.setItem("dewasa-ayu-profile", JSON.stringify(profile));
    window.setTimeout(() => router.push("/planner"), 550);
  }

  return (
    <div className="landing auth-landing">
      <header className="landing-nav auth-nav">
        <div className="nav-shell">
          <Link className="brand" href="/">
            <span className="brand-mark"><Leaf /></span>
            <span className="brand-name"><strong>Dewasa Ayu</strong><small>Wedding Planner</small></span>
          </Link>

          <div className="nav-actions">
            <span className="auth-nav-note">{isLogin ? "Belum memiliki akun?" : "Sudah memiliki akun?"}</span>
            <Link className="btn btn-gold" href={isLogin ? "/daftar" : "/login"}>
              {isLogin ? "Daftar" : "Masuk"} <i className="arrow" aria-hidden="true">↗</i>
            </Link>
          </div>
        </div>
      </header>

      <main className="stack auth-stack">
        <section className="panel auth-panel">
          {/* ---------------- Sisi cerita ---------------- */}
          <aside className="auth-story tone-ink" aria-label="Tentang Dewasa Ayu">
            <span className="eyebrow"><i aria-hidden="true">✦</i> Ruang kalian berdua</span>
            <h2>Hal indah dimulai dari rencana yang <span className="auth-underline">disusun bersama.</span></h2>
            <p>
              Satu tempat yang tenang untuk menyimpan setiap keputusan pernikahan,
              dari rencana pertama hingga hari bahagia tiba.
            </p>

            <ul className="auth-highlights">
              {highlights.map((item) => (
                <li key={item.title}>
                  <span className="tile-icon" aria-hidden="true"><item.icon /></span>
                  <div><strong>{item.title}</strong><small>{item.text}</small></div>
                </li>
              ))}
            </ul>

            <div className="auth-mini-card" aria-hidden="true">
              <div className="auth-mini-icon"><IconCheck /></div>
              <div><small>PERSIAPAN HARI INI</small><strong>Semua tetap dalam kendali</strong></div>
              <span>8%</span>
            </div>

            <Rays className="doodle auth-doodle-rays" />
            <Sprig className="doodle auth-doodle-sprig" />
            <Rings className="doodle auth-doodle-rings" />
          </aside>

          {/* ---------------- Sisi formulir ---------------- */}
          <section className="auth-form-side">
            <Link className="auth-back" href="/">
              <i className="arrow" aria-hidden="true">↖</i> Kembali ke beranda
            </Link>

            <div className="auth-heading">
              <span className="eyebrow"><i aria-hidden="true">✦</i> {isLogin ? "Selamat datang kembali" : "Mulai perjalanan kalian"}</span>
              <h1>{isLogin ? <>Masuk ke ruang <span className="mark">kalian.</span></> : <>Buat ruang untuk <span className="mark">kalian.</span></>}</h1>
              <p>{isLogin ? "Lanjutkan rencana yang telah kalian susun bersama." : "Mulai rapikan setiap detail menuju hari yang istimewa."}</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <label className="auth-field">
                  <span>Nama kalian</span>
                  <div className="auth-input"><i aria-hidden="true">♧</i><input name="name" type="text" placeholder="Contoh: Ayu &amp; Dewa" autoComplete="name" required /></div>
                </label>
              )}

              <label className="auth-field">
                <span>Alamat email</span>
                <div className="auth-input"><i aria-hidden="true">@</i><input name="email" type="email" placeholder="nama@email.com" autoComplete="email" required /></div>
              </label>

              <label className="auth-field">
                <span>Kata sandi</span>
                <div className="auth-input">
                  <i aria-hidden="true">◇</i>
                  <input name="password" type={showPassword ? "text" : "password"} placeholder={isLogin ? "Masukkan kata sandi" : "Minimal 8 karakter"} minLength={8} autoComplete={isLogin ? "current-password" : "new-password"} required />
                  <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}><EyeIcon crossed={showPassword} /></button>
                </div>
              </label>

              {!isLogin && (
                <label className="auth-field">
                  <span>Ulangi kata sandi</span>
                  <div className="auth-input">
                    <i aria-hidden="true">◇</i>
                    <input name="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Ketik ulang kata sandi" minLength={8} autoComplete="new-password" required />
                    <button className="password-toggle" type="button" onClick={() => setShowConfirm((value) => !value)} aria-label={showConfirm ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}><EyeIcon crossed={showConfirm} /></button>
                  </div>
                </label>
              )}

              {isLogin ? (
                <div className="auth-options">
                  <label className="auth-check"><input type="checkbox" name="remember" /><span /> Ingat saya</label>
                  <button type="button" className="auth-text-button" onClick={() => setError("Fitur pemulihan kata sandi akan tersedia setelah layanan email dihubungkan.")}>Lupa kata sandi?</button>
                </div>
              ) : (
                <label className="auth-check auth-agreement"><input type="checkbox" required /><span /> Saya menyetujui <a href="#ketentuan">Ketentuan Penggunaan</a> dan <a href="#privasi">Kebijakan Privasi</a>.</label>
              )}

              {error && <div className="auth-alert" role="alert">{error}</div>}

              <button className="btn btn-gold btn-lg auth-submit" type="submit" disabled={submitting}>
                {submitting ? "Menyiapkan ruang..." : isLogin ? "Masuk ke planner" : "Buat akun saya"}
                {!submitting && <i className="arrow" aria-hidden="true">↗</i>}
              </button>
            </form>

            <ul className="trust auth-trust">
              <li>Tersimpan otomatis</li><li>Siap dari ponsel</li><li>Privat di perangkat</li>
            </ul>

            <p className="auth-switch">
              {isLogin ? <>Belum memiliki akun? <Link href="/daftar">Daftar sekarang</Link></> : <>Sudah memiliki akun? <Link href="/login">Masuk di sini</Link></>}
            </p>

            <Wave className="doodle auth-doodle-wave" />
          </section>
        </section>
      </main>

      <footer className="auth-foot">
        <span>© {new Date().getFullYear()} Dewasa Ayu</span>
        <span>Data persiapan kalian tersimpan privat di perangkat ini.</span>
      </footer>
    </div>
  );
}
