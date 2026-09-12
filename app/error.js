"use client";

import Link from "next/link";
import { useEffect } from "react";

/* Batas galat untuk seluruh segmen app. Tanpa berkas ini, satu error saat
   render — misalnya localStorage yang menolak menulis di mode penyamaran —
   membuat pengguna melihat layar kosong tanpa penjelasan apa pun. */

export default function Error({ error, reset }) {
  useEffect(() => {
    // Sementara ke console; ganti ke Sentry/log terpusat saat backend siap.
    console.error("[dewasa-ayu] render error:", error);
  }, [error]);

  return (
    <div className="landing state-page">
      <main className="stack">
        <section className="panel state-panel">
          <span className="eyebrow"><i>❧</i> Ada yang tersendat</span>
          <h1>Halaman ini gagal dimuat.</h1>
          <p>
            Bukan salahmu — ada bagian aplikasi yang berhenti bekerja. Datamu yang
            sudah tersimpan tidak terpengaruh. Coba muat ulang dulu; kalau masih
            sama, kembali ke beranda.
          </p>
          <div className="actions">
            <button className="btn btn-gold" onClick={() => reset()}>
              Coba lagi <i className="arrow">↗</i>
            </button>
            <Link className="btn btn-outline" href="/">Kembali ke beranda</Link>
          </div>
          {error?.digest && <p className="state-code">Kode rujukan: {error.digest}</p>}
        </section>
      </main>
    </div>
  );
}
