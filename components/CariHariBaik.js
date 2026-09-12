"use client";

import { useState } from "react";
import Link from "next/link";
import { cariHariBaik, keIso, KEPERLUAN } from "../lib/bali-calendar";

const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function tanggalPanjang(h) {
  return `${h.masehi.hari} ${NAMA_BULAN[h.masehi.bulan - 1]} ${h.masehi.tahun}`;
}

export default function CariHariBaik({ keperluanAwal = "pernikahan" }) {
  const hariIni = new Date();
  const enamBulan = new Date(hariIni.getFullYear(), hariIni.getMonth() + 6, hariIni.getDate());

  const [mulai, setMulai] = useState(keIso(hariIni));
  const [selesai, setSelesai] = useState(keIso(enamBulan));
  const [keperluan, setKeperluan] = useState(keperluanAwal);
  const [tanpaAla, setTanpaAla] = useState(true);
  const [lahir1, setLahir1] = useState("");
  const [lahir2, setLahir2] = useState("");
  const [otonanWajib, setOtonanWajib] = useState(false);
  const [hasil, setHasil] = useState(null);
  const [galat, setGalat] = useState("");

  const cari = (e) => {
    e.preventDefault();
    setGalat("");
    const a = new Date(mulai);
    const b = new Date(selesai);
    if (b < a) return setGalat("Tanggal akhir harus setelah tanggal mulai.");
    if ((b - a) / 86400000 > 800) return setGalat("Rentang maksimal sekitar dua tahun.");
    const otonan = [lahir1, lahir2].filter(Boolean);
    setHasil(cariHariBaik(mulai, selesai, { keperluan, tanpaAla, otonan, otonanWajib, batas: 40 }));
  };

  return (
    <div className="chb">
      <form className="chb-form" onSubmit={cari}>
        <label>
          <span>Dari tanggal</span>
          <input type="date" value={mulai} onChange={(e) => setMulai(e.target.value)} required />
        </label>
        <label>
          <span>Sampai tanggal</span>
          <input type="date" value={selesai} onChange={(e) => setSelesai(e.target.value)} required />
        </label>
        <label>
          <span>Keperluan</span>
          <select value={keperluan} onChange={(e) => setKeperluan(e.target.value)}>
            {Object.entries(KEPERLUAN).map(([k, v]) => <option value={k} key={k}>{v}</option>)}
          </select>
        </label>
        <label>
          <span>Lahir mempelai 1 (opsional)</span>
          <input type="date" value={lahir1} onChange={(e) => setLahir1(e.target.value)} />
        </label>
        <label>
          <span>Lahir mempelai 2 (opsional)</span>
          <input type="date" value={lahir2} onChange={(e) => setLahir2(e.target.value)} />
        </label>
        <label className="chb-cek">
          <input type="checkbox" checked={tanpaAla} onChange={(e) => setTanpaAla(e.target.checked)} />
          <span>Sembunyikan hari yang punya penghalang</span>
        </label>
        <label className="chb-cek">
          <input
            type="checkbox"
            checked={otonanWajib}
            disabled={!lahir1 && !lahir2}
            onChange={(e) => setOtonanWajib(e.target.checked)}
          />
          <span>Hanya hari yang baik menurut otonan</span>
        </label>
        <button className="btn btn-gold" type="submit">Cari hari baik</button>
      </form>

      <p className="chb-nota">
        Tanggal lahir dipakai untuk hitungan Karya Ayu — kecocokan hari dengan
        kelahiran seseorang. Hitungan ini berdiri sendiri dan dilaporkan terpisah
        dari ala-ayuning dewasa, bukan dijumlahkan jadi satu nilai.
      </p>

      {galat && <p className="chb-galat">{galat}</p>}

      {hasil && (
        <div className="chb-hasil">
          <p className="chb-ringkas">
            {hasil.length === 0
              ? "Tidak ada tanggal yang lolos saringan pada rentang ini. Coba perlebar rentang atau matikan saringan penghalang."
              : `${hasil.length} tanggal teratas, diurutkan dari yang paling mendukung.`}
          </p>

          {hasil.map((h) => (
            <article className={`chb-kartu ${h.nilai.bersih ? "bersih" : "berhalangan"}`} key={h.tanggal}>
              <header>
                <div>
                  <strong>{tanggalPanjang(h)}</strong>
                  <span>{h.wewaran.saptawara} {h.wewaran.pancawara} {h.wuku.nama} · {h.sasih?.label} {h.sasih?.nama}</span>
                </div>
                <div className="chb-aksi">
                  <span className="chb-skor" title="Makin tinggi makin mendukung">{h.nilai.skor}</span>
                  <Link className="chb-tautan" href={`/kalender?tanggal=${h.tanggal}`}>
                    Lihat di kalender ↗
                  </Link>
                </div>
              </header>

              {h.nilai.kriteria && (
                <div className="chb-kriteria-blok">
                  <span>Kriteria pawiwahan umum ({h.nilai.kriteria.jumlahCocok}/3 terpenuhi)</span>
                  <ul className="chb-kriteria">
                    {h.nilai.kriteria.cocok.map((k) => <li className="ya" key={k}>✓ {k}</li>)}
                    {h.nilai.kriteria.belum.map((k) => <li key={k}>{k}</li>)}
                  </ul>
                </div>
              )}

              {h.nilai.karyaAyu && (
                <div className="chb-otonan">
                  <span>Karya ayu menurut otonan</span>
                  <ul>
                    {h.nilai.karyaAyu.per.map((k, i) => (
                      <li className={k.baik ? "ya" : "tidak"} key={`${k.lahir}-${i}`}>
                        <b>{k.kategori}</b> untuk kelahiran {k.lahir} — {k.arti}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {h.nilai.pendukung.length > 0 && (
                <p className="chb-dukung"><b>Mendukung:</b> {h.nilai.pendukung.map((d) => d.nama).join(", ")}</p>
              )}
              {h.nilai.penghalang.length > 0 && (
                <p className="chb-halang"><b>Penghalang:</b> {h.nilai.penghalang.map((d) => d.nama).join(", ")}</p>
              )}
              {h.nilai.umumAla.length > 0 && (
                <p className="chb-umum">Catatan umum: {h.nilai.umumAla.slice(0, 4).map((d) => d.nama).join(", ")}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
