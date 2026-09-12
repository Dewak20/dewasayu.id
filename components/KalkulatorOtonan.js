"use client";

import { useState } from "react";
import { otonan, keIso } from "../lib/bali-calendar";

const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function KalkulatorOtonan() {
  const [lahir, setLahir] = useState("");
  const [hasil, setHasil] = useState(null);
  const [galat, setGalat] = useState("");

  const hitung = (e) => {
    e.preventDefault();
    setGalat("");
    if (!lahir) return;
    if (new Date(lahir) > new Date()) return setGalat("Tanggal lahir tidak boleh di masa depan.");
    try {
      setHasil(otonan(lahir, { jumlah: 6 }));
    } catch {
      setGalat("Tanggal itu di luar rentang yang didukung (1970–2100).");
    }
  };

  return (
    <div className="oto">
      <form className="oto-form" onSubmit={hitung}>
        <label>
          <span>Tanggal lahir</span>
          <input type="date" value={lahir} max={keIso(new Date())}
            onChange={(e) => setLahir(e.target.value)} required />
        </label>
        <button className="btn btn-gold" type="submit">Hitung otonan</button>
      </form>

      {galat && <p className="chb-galat">{galat}</p>}

      {hasil && (
        <div className="oto-hasil">
          <div className="oto-lahir">
            <span className="kb-eyebrow">Wewaran kelahiran</span>
            <h3>{hasil.lahir.wewaran.saptawara} {hasil.lahir.wewaran.pancawara} {hasil.lahir.wuku.nama}</h3>
            <p>
              Sasih {hasil.lahir.sasih?.nama} · {hasil.lahir.sasih?.label} · Saka {hasil.lahir.saka}
              <br />Pancasuda {hasil.lahir.pancasuda} · Pararasan {hasil.lahir.pararasan} · Lintang {hasil.lahir.lintang}
            </p>
          </div>

          <span className="kb-blok-judul">Otonan berikutnya (tiap 210 hari)</span>
          <ol className="oto-daftar">
            {hasil.berikutnya.map((o) => (
              <li key={o.tanggal}>
                <strong>{o.masehi.hari} {NAMA_BULAN[o.masehi.bulan - 1]} {o.masehi.tahun}</strong>
                <span>{o.wewaran.saptawara} {o.wewaran.pancawara} {o.wuku.nama} · {o.sasih?.label} {o.sasih?.nama}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
