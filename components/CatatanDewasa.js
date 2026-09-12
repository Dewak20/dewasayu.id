"use client";

import { useMemo } from "react";
import Link from "next/link";
import { hariBali, nilaiHari, RENTANG_DIDUKUNG } from "../lib/bali-calendar";

/**
 * Ringkasan ala-ayuning dewasa untuk satu tanggal acara di planner.
 * Sengaja pendek: yang ditonjolkan hanya penghalang untuk keperluan terkait,
 * karena itu yang biasanya membuat keluarga menggeser tanggal.
 */
export default function CatatanDewasa({ tanggal, keperluan = "pernikahan" }) {
  const info = useMemo(() => {
    if (!tanggal) return null;
    const d = new Date(tanggal);
    if (Number.isNaN(d.getTime())) return null;
    if (d < RENTANG_DIDUKUNG.mulai || d > RENTANG_DIDUKUNG.selesai) return "luar-rentang";
    const hari = hariBali(d);
    return { hari, nilai: nilaiHari(hari, keperluan) };
  }, [tanggal, keperluan]);

  if (!info) return null;
  if (info === "luar-rentang") {
    return (
      <div className="pl-dewasa">
        <p className="pl-aman">Tanggal ini di luar rentang kalender Bali yang tersedia (1970–2100).</p>
      </div>
    );
  }

  const { hari, nilai } = info;
  const umumAla = nilai.umumAla.filter((d) => !nilai.penghalang.some((p) => p.nama === d.nama)).slice(0, 3);

  return (
    <div className="pl-dewasa">
      <h4>Menurut kalender Bali</h4>
      <p className="pl-wew">
        {hari.wewaran.saptawara} {hari.wewaran.pancawara} {hari.wuku.nama} · {hari.sasih?.label} sasih {hari.sasih?.nama}
      </p>

      {nilai.penghalang.length === 0 && nilai.pendukung.length === 0 && umumAla.length === 0 && (
        <p className="pl-aman">Tidak ada dewasa ala maupun ayu yang menonjol pada tanggal ini.</p>
      )}

      <ul>
        {nilai.penghalang.map((d) => (
          <li className="ala" key={d.nama}><b>{d.nama}</b> — {d.penjelasan}</li>
        ))}
        {nilai.pendukung.map((d) => (
          <li className="ayu" key={d.nama}><b>{d.nama}</b> — {d.penjelasan}</li>
        ))}
        {umumAla.map((d) => (
          <li key={d.nama}><b>{d.nama}</b> — {d.penjelasan}</li>
        ))}
      </ul>

      <p className="pl-aman" style={{ marginTop: 10 }}>
        <Link href={`/kalender?tanggal=${hari.tanggal}`}>Lihat detail lengkap di kalender ↗</Link>
      </p>
    </div>
  );
}
