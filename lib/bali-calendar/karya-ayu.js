// Karya Ayu — kecocokan satu hari dengan kelahiran seseorang.
//
// Aturannya menghitung urip: urip saptawara + pancawara hari lahir dijumlahkan
// dengan urip hari yang ditimbang, lalu dibagi empat. Sisanya menentukan
// kategori, dan kategori menentukan baik atau tidak.
//
// Diturunkan dari keluaran karyaayu.php kalenderbali.org dan divalidasi terhadap
// 4.380 hari (6 tanggal lahir × 2 tahun penuh) — lihat validate.mjs.
//
// Ini lapisan yang berbeda dari ala-ayuning dewasa: dewasa berlaku untuk semua
// orang pada hari itu, Karya Ayu terikat pada kelahiran seseorang. Karena itu
// keduanya dilaporkan terpisah dan tidak dijumlahkan jadi satu skor.

import { hariBali } from "./index.js";

// Urutan siklus dimulai dari sisa 1, bukan 0 — hitungan wariga dimulai di Guru.
const KATEGORI = ["Sempoyong", "Guru", "Ratu", "Rogoh"];
const BAIK = new Set(["Guru", "Ratu"]);

const ARTI = {
  Guru: "Dituntun dan direstui — baik untuk memulai karya.",
  Ratu: "Berwibawa dan dihormati — baik untuk karya besar.",
  Sempoyong: "Goyah, tidak berpijak kuat — sebaiknya dihindari.",
  Rogoh: "Rawan kehilangan dan gangguan — sebaiknya dihindari."
};

/**
 * Karya Ayu satu hari terhadap satu kelahiran.
 *
 * @param {object|string|Date} lahir  tanggal lahir, atau keluaran hariBali()
 * @param {object} hari  keluaran hariBali() untuk hari yang ditimbang
 */
export function karyaAyu(lahir, hari) {
  const l = lahir && typeof lahir === "object" && lahir.wewaran ? lahir : hariBali(lahir);
  const jumlah = l.wewaran.urip.jumlah + hari.wewaran.urip.jumlah;
  const kategori = KATEGORI[jumlah % 4];
  return {
    kategori,
    baik: BAIK.has(kategori),
    arti: ARTI[kategori],
    uripLahir: l.wewaran.urip.jumlah,
    uripHari: hari.wewaran.urip.jumlah,
    lahir: l.tanggal
  };
}

/**
 * Karya Ayu untuk beberapa kelahiran sekaligus (mis. dua mempelai).
 * `bersih` hanya benar kalau hari itu baik bagi semuanya.
 */
export function karyaAyuBersama(daftarLahir, hari) {
  const per = daftarLahir.map((l) => karyaAyu(l, hari));
  return { per, bersih: per.every((k) => k.baik), jumlahBaik: per.filter((k) => k.baik).length };
}

export { KATEGORI, ARTI };
