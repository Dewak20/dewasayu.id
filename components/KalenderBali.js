"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hariBali, keIso, RENTANG_DIDUKUNG } from "../lib/bali-calendar";

const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const NAMA_HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const NAMA_HARI_PANJANG = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function selBulan(tahun, bulan) {
  const pertama = new Date(tahun, bulan, 1);
  const jumlah = new Date(tahun, bulan + 1, 0).getDate();
  const sel = [];
  for (let i = 0; i < pertama.getDay(); i++) sel.push(null);
  for (let d = 1; d <= jumlah; d++) sel.push(hariBali(new Date(tahun, bulan, d)));
  while (sel.length % 7) sel.push(null);
  return sel;
}

/** Sel dipecah jadi baris tujuh hari supaya strukturnya benar-benar grid. */
function baris7(sel) {
  const baris = [];
  for (let i = 0; i < sel.length; i += 7) baris.push(sel.slice(i, i + 7));
  return baris;
}

const dalamRentang = (d) => d >= RENTANG_DIDUKUNG.mulai && d <= RENTANG_DIDUKUNG.selesai;

/** Label sel untuk pembaca layar: tanggal Masehi lengkap plus wewaran dan penanda. */
function labelSel(h) {
  const bagian = [
    `${NAMA_HARI_PANJANG[h.masehi.hariMinggu]}, ${h.masehi.hari} ${NAMA_BULAN[h.masehi.bulan - 1]} ${h.masehi.tahun}`,
    `${h.wewaran.saptawara} ${h.wewaran.pancawara} wuku ${h.wuku.nama}`
  ];
  if (h.sasih) bagian.push(`${h.sasih.label} sasih ${h.sasih.nama}`);
  if (h.rerainan.length) bagian.push(h.rerainan.map((r) => r.nama).join(", "));
  return bagian.join(". ");
}

function Baris({ label, children, tafsir }) {
  return (
    <div className={`kb-baris${tafsir ? " bertafsir" : ""}`}>
      <div className="kb-baris-atas">
        <span>{label}</span>
        <strong>{children}</strong>
      </div>
      {tafsir && <p className="kb-tafsir">{tafsir}</p>}
    </div>
  );
}

// Rerainan "raya" (Galungan, Kuningan, Nyepi, Saraswati, …) ditandai lebih tegas
// daripada rerainan harian seperti Kajeng Keliwon atau Anggar Kasih.
const adaRaya = (h) => h.rerainan.some((r) => r.jenis === "raya");

function DaftarRerainan({ butir, kosong }) {
  if (butir.length === 0) return <p className="kb-kosong">{kosong}</p>;
  return (
    <ul className="kb-rerainan">
      {butir.map((r) => (
        <li key={r.nama} className={`kb-rerainan-${r.jenis}`}>
          <strong>{r.nama}</strong>
          <small>{r.sumber === "masehi" ? "tanggal Masehi tetap" : `dari ${r.sumber}`}</small>
        </li>
      ))}
    </ul>
  );
}

export default function KalenderBali({ awal, bulanAwal }) {
  const mula = awal && !Number.isNaN(new Date(awal).getTime()) ? new Date(awal) : new Date();
  const tampil = /^\d{4}-\d{2}$/.test(bulanAwal ?? "")
    ? new Date(Number(bulanAwal.slice(0, 4)), Number(bulanAwal.slice(5)) - 1, 1)
    : mula;
  const [tahun, setTahun] = useState(tampil.getFullYear());
  const [bulan, setBulan] = useState(tampil.getMonth());
  const [pilih, setPilih] = useState(keIso(mula));
  const [tampilNasional, setTampilNasional] = useState(false);
  // Teks tafsir ~30 kB dan hanya dipakai di panel detail, jadi diambil setelah
  // halaman tampil alih-alih ikut bundel awal.
  const [arti, setArti] = useState(null);
  useEffect(() => {
    let batal = false;
    import("../lib/bali-calendar/data/arti.js")
      .then((m) => { if (!batal) setArti(m.default); })
      .catch(() => {});
    return () => { batal = true; };
  }, []);
  const tafsir = (bidang, nilai) => arti?.[bidang]?.[nilai];

  const sel = useMemo(() => selBulan(tahun, bulan), [tahun, bulan]);
  const rerainanBulan = useMemo(
    () => sel.filter(Boolean).flatMap((h) => h.rerainan.map((r) => ({ ...r, hari: h }))),
    [sel]
  );
  const hari = useMemo(() => hariBali(pilih), [pilih]);
  const hariIni = keIso(new Date());
  const selRef = useRef(new Map());
  const mintaFokus = useRef(null);

  // Bulan dan tanggal terpilih ikut ke query param supaya tautannya bisa dibagikan.
  // history.replaceState dipakai, bukan router, karena halaman ini render di server
  // dan tidak perlu diambil ulang hanya untuk mengganti tampilan.
  useEffect(() => {
    const u = new URL(window.location.href);
    u.searchParams.set("tanggal", pilih);
    u.searchParams.set("bulan", `${tahun}-${String(bulan + 1).padStart(2, "0")}`);
    window.history.replaceState(null, "", u);
  }, [pilih, tahun, bulan]);

  // Setelah panah memindahkan pilihan ke bulan lain, fokus menyusul selnya.
  useEffect(() => {
    if (!mintaFokus.current) return;
    selRef.current.get(mintaFokus.current)?.focus();
    mintaFokus.current = null;
  });

  const geser = (delta) => {
    const d = new Date(tahun, bulan + delta, 1);
    if (!dalamRentang(d)) return;
    setTahun(d.getFullYear());
    setBulan(d.getMonth());
  };

  const bisaMundur = dalamRentang(new Date(tahun, bulan - 1, 1));
  const bisaMaju = dalamRentang(new Date(tahun, bulan + 1, 1));

  /** Pindah pilihan sejauh `delta` hari, ikut berganti bulan kalau perlu. */
  const pindah = useCallback((delta) => {
    const d = new Date(pilih);
    d.setDate(d.getDate() + delta);
    if (!dalamRentang(d)) return;
    const iso = keIso(d);
    setPilih(iso);
    setTahun(d.getFullYear());
    setBulan(d.getMonth());
    mintaFokus.current = iso;
  }, [pilih]);

  const padaTombol = (e) => {
    const langkah = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7,
      PageUp: -28, PageDown: 28 }[e.key];
    if (langkah !== undefined) {
      e.preventDefault();
      return pindah(langkah);
    }
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const d = new Date(pilih);
      const akhir = new Date(tahun, bulan + 1, 0).getDate();
      d.setDate(e.key === "Home" ? 1 : akhir);
      if (!dalamRentang(d)) return;
      setPilih(keIso(d));
      mintaFokus.current = keIso(d);
    }
  };

  return (
    <div className="kb">
      <div className="kb-grid-wrap">
        <div className="kb-head">
          <button type="button" onClick={() => geser(-1)} disabled={!bisaMundur}
            aria-label="Bulan sebelumnya">‹</button>
          <div className="kb-judul">
            <strong aria-live="polite">{NAMA_BULAN[bulan]} {tahun}</strong>
            <small>Saka {hari.saka ?? "-"}</small>
          </div>
          <button type="button" onClick={() => geser(1)} disabled={!bisaMaju}
            aria-label="Bulan berikutnya">›</button>
        </div>

        <div
          className="kb-grid"
          role="grid"
          aria-label={`Kalender ${NAMA_BULAN[bulan]} ${tahun}`}
          onKeyDown={padaTombol}
        >
          <div className="kb-grid-baris" role="row">
            {NAMA_HARI.map((n, i) => (
              <div className="kb-dow" role="columnheader" key={n}>
                <abbr title={NAMA_HARI_PANJANG[i]}>{n}</abbr>
              </div>
            ))}
          </div>
          {baris7(sel).map((minggu, r) => (
            <div className="kb-grid-baris" role="row" key={`r${r}`}>
              {minggu.map((h, i) => {
                if (!h) return <div className="kb-sel kosong" role="gridcell" key={`k${r}-${i}`} />;
                const terpilih = h.tanggal === pilih;
                const penting = h.sasih?.purnama || h.sasih?.tilem;
                const raya = adaRaya(h);
                const kelas = [
                  "kb-sel",
                  terpilih ? "aktif" : "",
                  h.tanggal === hariIni ? "ini" : "",
                  penting ? "penting" : "",
                  raya ? "raya" : h.rerainan.length ? "berrerainan" : ""
                ].filter(Boolean).join(" ");
                return (
                  <div role="gridcell" aria-selected={terpilih} key={h.tanggal}>
                    <button
                      type="button"
                      className={kelas}
                      // Satu sel saja yang bisa di-tab; sisanya dijangkau tombol panah.
                      tabIndex={terpilih ? 0 : -1}
                      aria-label={labelSel(h)}
                      aria-current={h.tanggal === hariIni ? "date" : undefined}
                      ref={(el) => {
                        if (el) selRef.current.set(h.tanggal, el);
                        else selRef.current.delete(h.tanggal);
                      }}
                      onClick={() => setPilih(h.tanggal)}
                    >
                      <span className="tgl">
                        {h.masehi.hari}
                        {h.rerainan.length > 0 && <i className="kb-tanda" aria-hidden="true" />}
                      </span>
                      <span className="wew" aria-hidden="true">{h.wewaran.pancawara}</span>
                      <span className="lun" aria-hidden="true">
                        {h.sasih?.purnama ? "Purnama" : h.sasih?.tilem ? "Tilem" : h.sasih?.label}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <p className="kb-catatan">
          Wuku berganti tiap 7 hari; nama wuku dan seluruh wewaran tampil pada panel
          detail saat satu tanggal dipilih. Titik pada tanggal menandai adanya rerainan.
          Gunakan tombol panah untuk berpindah tanggal.
        </p>
        {(!bisaMundur || !bisaMaju) && (
          <p className="kb-batas">
            Batas kalender Bali yang tersedia: {RENTANG_DIDUKUNG.mulai.getFullYear()}–
            {RENTANG_DIDUKUNG.selesai.getFullYear()}. Di luar itu pawukon masih terhitung,
            tapi sasih tidak.
          </p>
        )}

        <div className="kb-bulanan">
          <div className="kb-bulanan-head">
            <span className="kb-blok-judul">Rerainan {NAMA_BULAN[bulan]} {tahun} ({rerainanBulan.length})</span>
            <label className="kb-saklar">
              <input
                type="checkbox"
                checked={tampilNasional}
                onChange={(e) => setTampilNasional(e.target.checked)}
              />
              <span>Tampilkan hari peringatan nasional</span>
            </label>
          </div>

          {rerainanBulan.length === 0 && (
            <p className="kb-kosong">Tidak ada rerainan pada bulan ini.</p>
          )}
          <ol className="kb-bulanan-daftar">
            {rerainanBulan.map((r) => (
              <li key={`${r.hari.tanggal}-${r.nama}`}>
                <button type="button" onClick={() => setPilih(r.hari.tanggal)}>
                  <span className="kb-tgl">{r.hari.masehi.hari}</span>
                  <span className={`kb-nama kb-rerainan-${r.jenis}`}>{r.nama}</span>
                </button>
              </li>
            ))}
          </ol>

          {tampilNasional && (
            <ol className="kb-bulanan-daftar kb-nasional">
              {sel.filter(Boolean).flatMap((h) => h.hariPenting.map((r) => (
                <li key={`${h.tanggal}-${r.nama}`}>
                  <button type="button" onClick={() => setPilih(h.tanggal)}>
                    <span className="kb-tgl">{h.masehi.hari}</span>
                    <span className="kb-nama">{r.nama}</span>
                  </button>
                </li>
              )))}
            </ol>
          )}
        </div>
      </div>

      <aside className="kb-detail">
        <div className="kb-detail-head">
          <span className="kb-eyebrow">Detail hari</span>
          <h2>{hari.wewaran.saptawara} {hari.wewaran.pancawara} {hari.wuku.nama}</h2>
          <p>{hari.masehi.hari} {NAMA_BULAN[hari.masehi.bulan - 1]} {hari.masehi.tahun}</p>
        </div>

        <div className="kb-blok">
          <Baris label="Sasih">{hari.sasih?.nama ?? "-"}</Baris>
          <Baris label="Penanggal" tafsir={tafsir("tanggal", hari.sasih?.label)}>{hari.sasih?.label ?? "-"}</Baris>
          <Baris label="Wuku" tafsir={tafsir("wuku", hari.wuku.nama)}>{hari.wuku.nama}</Baris>
          <Baris label="Bhatara">{hari.wuku.bhatara}</Baris>
          <Baris label="Wewukon">{hari.wuku.wewukon.join(", ") || "—"}</Baris>
          <Baris label="Saka">{hari.saka ?? "-"}</Baris>
          {hari.sasih?.ngunaratri && (
            <p className="kb-nota-sumber">
              Setengah bulan ini kena <strong>ngunaratri</strong> — satu angka
              penanggal/pangelong dilewati. Kalender lain kadang menomori hari ini
              berbeda; penomoran di sini mengikuti kalenderbali.org.
            </p>
          )}
        </div>

        <div className="kb-blok">
          <span className="kb-blok-judul">Dauh ayu</span>
          <p className="kb-dauh">
            {hari.dauhAyu.map(([a, b]) => `${a}–${b}`).join(" · ")}
          </p>
          <p className="kb-dauh-nota">
            Rentang waktu yang dipandang baik untuk memulai kegiatan pada hari
            {" "}{hari.wewaran.saptawara}. Ditentukan saptawara, jadi berulang tiap tujuh hari.
          </p>
        </div>

        <div className="kb-blok">
          <span className="kb-blok-judul">Rerainan ({hari.rerainan.length})</span>
          <DaftarRerainan butir={hari.rerainan} kosong="Tidak ada rerainan pada hari ini." />
          {hari.hariPenting.length > 0 && (
            <>
              <span className="kb-blok-judul kb-subjudul">Hari peringatan nasional</span>
              <DaftarRerainan butir={hari.hariPenting} kosong="" />
            </>
          )}
        </div>

        <div className="kb-blok">
          <span className="kb-blok-judul">Wewaran</span>
          <Baris label="Ekawara" tafsir={tafsir("ekawara", hari.wewaran.ekawara)}>{hari.wewaran.ekawara}</Baris>
          <Baris label="Dwiwara" tafsir={tafsir("dwiwara", hari.wewaran.dwiwara)}>{hari.wewaran.dwiwara}</Baris>
          <Baris label="Triwara" tafsir={tafsir("triwara", hari.wewaran.triwara)}>{hari.wewaran.triwara}</Baris>
          <Baris label="Caturwara" tafsir={tafsir("caturwara", hari.wewaran.caturwara)}>{hari.wewaran.caturwara}</Baris>
          <Baris label="Pancawara" tafsir={tafsir("pancawara", hari.wewaran.pancawara)}>{hari.wewaran.pancawara}</Baris>
          <Baris label="Sadwara" tafsir={tafsir("sadwara", hari.wewaran.sadwara)}>{hari.wewaran.sadwara}</Baris>
          <Baris label="Saptawara" tafsir={tafsir("saptawara", hari.wewaran.saptawara)}>{hari.wewaran.saptawara}</Baris>
          <Baris label="Astawara" tafsir={tafsir("astawara", hari.wewaran.astawara)}>{hari.wewaran.astawara}</Baris>
          <Baris label="Sangawara" tafsir={tafsir("sangawara", hari.wewaran.sangawara)}>{hari.wewaran.sangawara}</Baris>
          <Baris label="Dasawara" tafsir={tafsir("dasawara", hari.wewaran.dasawara)}>{hari.wewaran.dasawara}</Baris>
          <Baris label="Urip">{hari.wewaran.urip.saptawara} + {hari.wewaran.urip.pancawara} = {hari.wewaran.urip.jumlah}</Baris>
        </div>

        <div className="kb-blok">
          <span className="kb-blok-judul">Perhitungan lain</span>
          <Baris label="Ingkel jejepan">{hari.ingkelJejepan}</Baris>
          <Baris label="Ingkel wuku">{hari.ingkelWuku}</Baris>
          <Baris label="Watek">{hari.watek}</Baris>
          <Baris label="Lintang" tafsir={tafsir("lintang", hari.lintang)}>{hari.lintang}</Baris>
          <Baris label="Pararasan" tafsir={tafsir("pararasan", hari.pararasan)}>{hari.pararasan}</Baris>
          <Baris label="Pancasuda" tafsir={tafsir("pancasuda", hari.pancasuda)}>{hari.pancasuda}</Baris>
          <Baris label="Ekajalaresi" tafsir={tafsir("ekajalaresi", hari.ekajalaresi)}>{hari.ekajalaresi}</Baris>
          <Baris label="Pratiti" tafsir={tafsir("pratiti", hari.pratiti)}>{hari.pratiti}</Baris>
        </div>

        <div className="kb-blok">
          <span className="kb-blok-judul">Ala-ayuning dewasa ({hari.dewasa.length})</span>
          {hari.dewasa.length === 0 && <p className="kb-kosong">Tidak ada dewasa khusus pada hari ini.</p>}
          {hari.dewasa.map((d) => (
            <div className={`kb-dewasa ${d.buruk && !d.baik ? "ala" : d.baik && !d.buruk ? "ayu" : "campur"}`} key={d.nama}>
              <strong>{d.nama}</strong>
              <p>{d.penjelasan}</p>
              <small>Alahing dewasa {d.alahing ?? d.alahingVarian?.join("/") ?? "—"} · pola: {d.polaRaw}</small>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
