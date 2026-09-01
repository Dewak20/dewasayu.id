"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const EyeIcon = ({ crossed = false }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M2.5 12s3.4-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.4 5.5-9.5 5.5S2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.5" />
    {crossed && <path d="m4 4 16 16" />}
  </svg>
);

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
    <main className="auth-page">
      <section className="auth-story" aria-label="Tentang Dewasa Ayu">
        <Link className="auth-brand" href="/" aria-label="Kembali ke beranda Dewasa Ayu">
          <span className="auth-brand-mark">DA</span>
          <span><strong>Dewasa Ayu</strong><small>Wedding Planner</small></span>
        </Link>

        <div className="auth-story-copy">
          <span className="auth-kicker">RUANG KALIAN BERDUA</span>
          <blockquote>“Hal-hal indah dimulai dari rencana yang disusun bersama.”</blockquote>
          <p>Satu tempat yang tenang untuk menyimpan setiap keputusan, dari rencana pertama hingga hari bahagia tiba.</p>
        </div>

        <div className="auth-mini-card" aria-hidden="true">
          <div className="auth-mini-icon">✓</div>
          <div><small>PERSIAPAN HARI INI</small><strong>Semua tetap dalam kendali</strong></div>
          <span>8%</span>
        </div>
        <span className="auth-leaf auth-leaf-one">❧</span>
        <span className="auth-leaf auth-leaf-two">❧</span>
      </section>

      <section className="auth-panel">
        <div className="auth-mobile-header">
          <Link className="auth-brand" href="/">
            <span className="auth-brand-mark">DA</span>
            <span><strong>Dewasa Ayu</strong><small>Wedding Planner</small></span>
          </Link>
        </div>

        <div className="auth-form-wrap">
          <Link className="auth-back" href="/"><span>←</span> Kembali ke beranda</Link>
          <div className="auth-heading">
            <span className="auth-kicker">{isLogin ? "SELAMAT DATANG KEMBALI" : "MULAI PERJALANAN KALIAN"}</span>
            <h1>{isLogin ? <>Masuk ke ruang <em>kalian.</em></> : <>Buat ruang untuk <em>kalian.</em></>}</h1>
            <p>{isLogin ? "Lanjutkan rencana yang telah kalian susun bersama." : "Mulai rapikan setiap detail menuju hari yang istimewa."}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <label className="auth-field">
                <span>Nama kalian</span>
                <div className="auth-input"><i>♧</i><input name="name" type="text" placeholder="Contoh: Ayu & Dewa" autoComplete="name" required /></div>
              </label>
            )}

            <label className="auth-field">
              <span>Alamat email</span>
              <div className="auth-input"><i>@</i><input name="email" type="email" placeholder="nama@email.com" autoComplete="email" required /></div>
            </label>

            <label className="auth-field">
              <span>Kata sandi</span>
              <div className="auth-input">
                <i>◇</i>
                <input name="password" type={showPassword ? "text" : "password"} placeholder={isLogin ? "Masukkan kata sandi" : "Minimal 8 karakter"} minLength={8} autoComplete={isLogin ? "current-password" : "new-password"} required />
                <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}><EyeIcon crossed={showPassword} /></button>
              </div>
            </label>

            {!isLogin && (
              <label className="auth-field">
                <span>Ulangi kata sandi</span>
                <div className="auth-input">
                  <i>◇</i>
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

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? "Menyiapkan ruang..." : isLogin ? "Masuk ke planner" : "Buat akun saya"}<span>{submitting ? "" : "→"}</span>
            </button>
          </form>

          <div className="auth-switch">
            {isLogin ? <>Belum memiliki akun? <Link href="/daftar">Daftar sekarang</Link></> : <>Sudah memiliki akun? <Link href="/login">Masuk di sini</Link></>}
          </div>
          <p className="auth-security"><span>♢</span> Data persiapan kalian tetap tersimpan secara privat di perangkat ini.</p>
        </div>
      </section>
    </main>
  );
}
