import { ImageResponse } from "next/og";

/* Gambar pratinjau tautan, dibuat saat build — tidak perlu aset statis.
   Ini yang muncul saat seseorang menempel tautan situs di WhatsApp. */

export const alt = "Dewasa Ayu — Hari Baik & Persiapan Pernikahan Bali";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 84px",
          background: "linear-gradient(135deg, #24362c 0%, #131e18 70%)",
          color: "#f7f1e6",
          fontFamily: "serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "#e2bf74",
              color: "#201a09",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26
            }}
          >
            DA
          </div>
          <div style={{ fontSize: 22, letterSpacing: 6, color: "#9faea3" }}>DEWASA AYU</div>
        </div>

        <div style={{ fontSize: 68, lineHeight: 1.1, marginTop: 44, maxWidth: 900 }}>
          Hari baik pernikahan Bali, dihitung dari wariga.
        </div>

        <div style={{ fontSize: 28, lineHeight: 1.45, marginTop: 28, color: "#9faea3", maxWidth: 820 }}>
          Lalu kelola anggaran, vendor, tamu, dan seluruh rangkaian acara dalam satu ruang kerja.
        </div>

        <div style={{ display: "flex", marginTop: 48 }}>
          <div
            style={{
              display: "flex",
              padding: "14px 30px",
              borderRadius: 999,
              background: "#e2bf74",
              color: "#201a09",
              fontSize: 24
            }}
          >
            dewasayu.id
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
