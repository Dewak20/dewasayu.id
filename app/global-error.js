"use client";

/* Jaring terakhir: dipakai kalau root layout sendiri yang gagal, sehingga
   error.js tidak sempat dirender. Wajib membawa <html> dan <body> sendiri,
   dan tidak boleh bergantung pada CSS aplikasi karena layout-nya gagal. */

export default function GlobalError({ error, reset }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, background: "#131e18", color: "#f7f1e6", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ maxWidth: 480, textAlign: "center" }}>
            <p style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "#e2bf74", margin: 0 }}>
              Dewasa Ayu
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 400, margin: "16px 0 12px", lineHeight: 1.15 }}>
              Aplikasi gagal dimuat.
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "#9faea3", margin: 0 }}>
              Terjadi kesalahan sebelum halaman sempat tampil. Datamu yang sudah
              tersimpan di perangkat ini tidak terpengaruh.
            </p>
            <button
              onClick={() => reset()}
              style={{ marginTop: 24, padding: "13px 26px", border: 0, borderRadius: 999, background: "#e2bf74", color: "#201a09", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              Coba lagi
            </button>
            {error?.digest && (
              <p style={{ marginTop: 18, fontSize: 12, color: "#6f7a71" }}>Kode rujukan: {error.digest}</p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
