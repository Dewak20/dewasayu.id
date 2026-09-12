// Rerainan (hari suci) dan hari penting nasional.
//
// Tiga sumber, dipisah supaya jelas mana yang datang dari mana:
//
// 1. Pawukon murni — Tumpek, Anggar Kasih, Buda Keliwon/Wage, rangkaian Galungan
//    & Kuningan, Hari Bhatara Sri, dan kawan-kawan. Semuanya berulang persis tiap
//    210 hari, jadi ditabelkan per indeks pawukon di `data/rerainan.js`. Tabel itu
//    dibangun dari daftar bulanan kalenderbali.org (18 tahun sampel, lintas tiga
//    era penanggalan) dan sebuah nama hanya masuk kalau ia muncul pada *semua*
//    kemunculan indeks itu.
// 2. Sasih — Purnama, Tilem, dan turunannya (Nyepi, Ngembak Geni, Siwa Ratri).
//    Dihitung, bukan ditabelkan.
// 3. Kajeng Keliwon — perlu keduanya: hari Kajeng + Keliwon (pawukon) sementara
//    variannya ditentukan posisi terhadap purnama-tilem (sasih).
//
// Lihat README untuk aturan Kajeng Keliwon dan batas cakupannya.

import tabel from "./data/rerainan.js";

const SASIH_KEPITU = "Kepitu";
const SASIH_KEDASA = "Kedasa";

// Kajeng Keliwon jatuh tiap 15 hari; indeks pawukon-nya selalu ≡ 8 (mod 15).
const KAJENG_KELIWON_MOD = 8;
// Wuku Watugunung hari Kajeng Keliwon — Pamelastali, sekaligus Watugunung Runtuh.
const PAWUKON_PAMELASTALI = 203;

function butir(nama, jenis, sumber) {
  return { nama, jenis, sumber };
}

/**
 * Nyepi: hari pertama sasih Kedasa, yaitu hari sesudah Tilem yang sudah berlabel
 * Kedasa. Biasanya penanggal 1, tapi kalau ngunaratri melewati angka 1 (mis. 2020)
 * hari itu langsung bernomor 2 — dan kalenderbali.org tetap menaruh Nyepi di sana.
 *
 * Dipatok ke label sasih, bukan ke "sehari sesudah Tilem Kesanga", supaya tetap
 * benar pada era penanggalan 1993-2002 ketika nama sasih berganti pada hari Tilem.
 */
function isNyepi(s, kemarin) {
  return Boolean(s && kemarin?.tilem && s.fase === "penanggal" &&
    s.namaDasar === SASIH_KEDASA && !s.mala);
}

/**
 * Varian Kajeng Keliwon menurut posisi terhadap purnama-tilem.
 *
 * Pola ini dibaca dari 349 Kajeng Keliwon bernama di 18 tahun sampel, bukan
 * ditebak: Enyitan hanya pada penanggal 8–14, Uwudan pada seluruh pangelong
 * 1–14. Pada penanggal 1–7 serta tepat di Purnama dan Tilem, kalenderbali.org
 * tidak memberi varian sama sekali — jadi kita pun tidak mengarang satu.
 */
function varianKajengKeliwon(s) {
  if (!s) return null;
  if (s.fase === "penanggal" && s.angka >= 8 && s.angka <= 14) return "Enyitan";
  if (s.fase === "pangelong" && s.angka <= 14) return "Uwudan";
  return null;
}

/**
 * Rerainan pada satu hari.
 *
 * @param {object} hari  keluaran hariBali()
 * @param {(delta: number) => object|null} sasihPada  sasih `delta` hari dari hari ini
 * @returns {Array<{nama: string, jenis: string, sumber: "pawukon"|"sasih"|"pawukon+sasih"}>}
 */
export function rerainan(hari, sasihPada) {
  const hasil = [];

  for (const [nama, jenis] of tabel.pawukon[hari.pawukon] ?? []) {
    hasil.push(butir(nama, jenis, "pawukon"));
  }

  const s = hari.sasih;
  if (s) {
    if (s.purnama) hasil.push(butir(`Purnama ${s.nama}`, "purnama-tilem", "sasih"));
    if (s.tilem) hasil.push(butir(`Tilem ${s.nama}`, "purnama-tilem", "sasih"));

    // Ngembak Geni sehari sesudah Nyepi — tapi hanya kalau angka penanggalnya
    // benar-benar berurutan. Saat ngunaratri melewati angka yang seharusnya jadi
    // Ngembak Geni (mis. 1980), kalenderbali.org ikut menghilangkan hari itu.
    const kemarin = sasihPada(-1);
    if (isNyepi(s, kemarin)) hasil.push(butir("Hari Raya Nyepi", "raya", "sasih"));
    if (isNyepi(kemarin, sasihPada(-2)) && s.fase === "penanggal" && s.angka === kemarin.angka + 1) {
      hasil.push(butir("Ngembak Geni", "raya", "sasih"));
    }
    if (s.fase === "pangelong" && s.angka === 14 && s.namaDasar === SASIH_KEPITU && !s.mala) {
      hasil.push(butir("Hari Siwa Ratri", "raya", "sasih"));
    }
  }

  if (hari.wewaran.triwara === "Kajeng" && hari.wewaran.pancawara === "Keliwon") {
    if (hari.pawukon === PAWUKON_PAMELASTALI) {
      hasil.push(butir("Kajeng Keliwon Pamelastali/Watugunung Runtuh", "kajeng-keliwon", "pawukon"));
    }
    const varian = varianKajengKeliwon(s);
    if (varian) hasil.push(butir(`Kajeng Keliwon ${varian}`, "kajeng-keliwon", "pawukon+sasih"));
  }

  return hasil.sort((a, b) => a.nama.localeCompare(b.nama, "id"));
}

/** Hari peringatan nasional — tanggal Masehi tetap, jadi cukup tabel kecil. */
export function hariPenting(hari) {
  const md = hari.tanggal.slice(5);
  return (tabel.nasional[md] ?? []).map((nama) => butir(nama, "nasional", "masehi"));
}

export { KAJENG_KELIWON_MOD };
