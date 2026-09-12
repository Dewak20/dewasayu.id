// Cari tanggal contoh untuk tiap kalimat pola ala-ayuning dewasa.
//
//     node scripts/bali-calendar/probe-dewasa.mjs
//
// Dua hal yang belum diketahui dari korpus 220 aturan:
//
// 1. Tiga belas aturan belum pernah muncul di tahun yang sudah dipanen, jadi
//    alahing-nya belum diketahui.
// 2. Lima aturan punya alahing yang berubah-ubah — situs sumber memberi angka
//    berbeda tergantung kalimat pola mana yang cocok, dan pemetaannya belum ada.
//
// Keduanya bisa dijawab tanpa memanen tahun penuh: untuk tiap kalimat pola, cari
// satu tanggal yang cocok dengan kalimat itu saja (bukan kalimat lain dari aturan
// yang sama), lalu panen halaman harian tanggal-tanggal itu. Belasan request,
// bukan ribuan.
//
// Keluarannya `fixtures/probe_dewasa.json`, dipakai `scrape.py alaayu`.

import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { hariBali, dariNomorHari, nomorHari, RENTANG_DIDUKUNG } from "../../lib/bali-calendar/index.js";
import aturanSemua from "../../lib/bali-calendar/data/dewasa.js";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

// Salinan cocokKondisi dari index.js — sengaja dipisah supaya probe bisa menguji
// satu kalimat saja, sementara mesin hanya menguji aturan sebagai kesatuan.
function cocokKondisi(k, hari) {
  switch (k.t) {
    case "wara":
      if (k.cycle === "wuku") return hari.wuku.nama === k.v;
      if (k.cycle === "sasih") return hari.sasih?.namaDasar === k.v;
      return hari.wewaran[k.cycle] === k.v;
    case "tithi":
      return hari.sasih?.fase === k.phase && hari.sasih?.angka === k.n;
    case "phase":
      return hari.sasih?.fase === k.phase && hari.sasih?.angka !== 15;
    case "tithi_eq_sasih":
      return hari.sasih?.fase === k.phase && hari.sasih?.angka === hari.sasih?.indeks + 1;
    default:
      return false;
  }
}

const cocokKalimat = (kalimat, hari) => kalimat.every((k) => cocokKondisi(k, hari));

const alahing = JSON.parse(readFileSync(join(DIR, "alahing.json"), "utf8"));
const perlu = aturanSemua.filter((r) => !alahing[r.nama] || alahing[r.nama].length > 1);
console.log(`${perlu.length} aturan perlu diprobe (${aturanSemua.filter((r) => !alahing[r.nama]).length} tanpa bobot, ` +
  `${aturanSemua.filter((r) => alahing[r.nama]?.length > 1).length} bobot bervariasi)`);

const awal = nomorHari(RENTANG_DIDUKUNG.mulai);
const akhir = nomorHari(RENTANG_DIDUKUNG.selesai);
// Sampel selang-seling dari tengah rentang; cukup rapat untuk menangkap pola
// terlangka (kombinasi sasih × wewaran terpanjang berulang di bawah 10 tahun).
const CONTOH_PER_KALIMAT = 2;

const hasil = {};
const tanggalSet = new Set();
for (const r of perlu) {
  hasil[r.nama] = r.kondisi.map(() => []);
  for (let n = awal; n <= akhir; n++) {
    const h = hariBali(dariNomorHari(n));
    if (!h.sasih) continue;
    const cocok = r.kondisi.map((kal) => cocokKalimat(kal, h));
    const jumlah = cocok.filter(Boolean).length;
    if (jumlah !== 1) continue;            // harus khas satu kalimat saja
    const i = cocok.indexOf(true);
    if (hasil[r.nama][i].length >= CONTOH_PER_KALIMAT) continue;
    hasil[r.nama][i].push(h.tanggal);
    tanggalSet.add(h.tanggal);
  }
}

const kosong = [];
for (const r of perlu) {
  r.kondisi.forEach((_, i) => {
    if (hasil[r.nama][i].length === 0) kosong.push(`${r.nama} [kalimat ${i}]: ${r.polaRaw}`);
  });
}
console.log(`${tanggalSet.size} tanggal unik untuk dipanen`);
if (kosong.length) {
  console.log(`${kosong.length} kalimat tanpa tanggal khas (selalu berbarengan kalimat lain):`);
  for (const k of kosong) console.log("  " + k);
}

writeFileSync(join(DIR, "probe_dewasa.json"),
  JSON.stringify({ perAturan: hasil, tanggal: [...tanggalSet].sort() }, null, 0));
console.log("  -> fixtures/probe_dewasa.json");
