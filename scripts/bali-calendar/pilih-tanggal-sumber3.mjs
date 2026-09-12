// Pilih tanggal untuk dibandingkan dengan sumber ketiga (kalenderbali.info).
//
//     node scripts/bali-calendar/pilih-tanggal-sumber3.mjs
//
// Berbeda dari pembandingan dengan kalenderbali.com yang bisa memanen sebulan
// sekali request, sumber ketiga hanya menyediakan detail per hari. Jadi
// tanggalnya dipilih hemat: yang paling diagnostik lebih dulu, dibatasi per
// bulan, supaya cukup menjawab pertanyaannya tanpa membebani situs kecil.
//
// Prioritasnya tempat kalender paling mungkin berselisih:
//   1. nampih sasih dan mala sasih — penamaan bulan yang jarang
//   2. hari ngunaratri — di sinilah penomoran penanggal bisa berbeda
//   3. purnama & tilem — batas paruh bulan
//   4. sisanya sebaran biasa sebagai kontrol

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { hariBali, dariNomorHari, nomorHari, RENTANG_DIDUKUNG } from "../../lib/bali-calendar/index.js";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const awal = nomorHari(RENTANG_DIDUKUNG.mulai);
const akhir = nomorHari(RENTANG_DIDUKUNG.selesai);

const PER_KELOMPOK = { nampih: 24, mala: 30, ngunaratri: 40, purnamaTilem: 24, biasa: 32 };
const kelompok = { nampih: [], mala: [], ngunaratri: [], purnamaTilem: [], biasa: [] };

for (let n = awal; n <= akhir; n++) {
  const h = hariBali(dariNomorHari(n));
  if (!h.sasih) continue;
  if (h.sasih.nampih) kelompok.nampih.push(h.tanggal);
  else if (h.sasih.mala) kelompok.mala.push(h.tanggal);
  else if (h.sasih.ngunaratri) kelompok.ngunaratri.push(h.tanggal);
  else if (h.sasih.purnama || h.sasih.tilem) kelompok.purnamaTilem.push(h.tanggal);
  else kelompok.biasa.push(h.tanggal);
}

/** Ambil `n` tanggal yang tersebar merata di sepanjang daftar, bukan yang pertama-tama. */
const sebar = (daftar, n) => {
  if (daftar.length <= n) return [...daftar];
  const langkah = daftar.length / n;
  return Array.from({ length: n }, (_, i) => daftar[Math.floor(i * langkah)]);
};

const pilih = [];
for (const [nama, n] of Object.entries(PER_KELOMPOK)) {
  const diambil = sebar(kelompok[nama], n);
  pilih.push(...diambil);
  console.log(`${nama.padEnd(14)} ${String(kelompok[nama].length).padStart(6)} hari tersedia -> ambil ${diambil.length}`);
}

const unik = [...new Set(pilih)].sort();
console.log(`\n${unik.length} tanggal terpilih, ${unik[0]} .. ${unik[unik.length - 1]}`);
writeFileSync(join(DIR, "sumber3_tanggal.json"), JSON.stringify(unik));
console.log("  -> fixtures/sumber3_tanggal.json");
