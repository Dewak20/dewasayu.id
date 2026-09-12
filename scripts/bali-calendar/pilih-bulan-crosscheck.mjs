// Pilih bulan-bulan untuk dibandingkan dengan sumber kedua (Tahap 4).
//
//     node scripts/bali-calendar/pilih-bulan-crosscheck.mjs
//
// Bukan sampel acak rata: yang dicari justru tempat kalender paling mungkin
// berbeda — nampih sasih, mala sasih, dan setengah-bulan yang kena ngunaratri —
// ditambah sebaran merata 1970-2100 sebagai pembanding kasus biasa.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { hariBali, dariNomorHari, nomorHari, RENTANG_DIDUKUNG } from "../../lib/bali-calendar/index.js";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const awal = nomorHari(RENTANG_DIDUKUNG.mulai);
const akhir = nomorHari(RENTANG_DIDUKUNG.selesai);

const nampih = new Set(), mala = new Set(), skip = new Set(), biasa = new Set();
for (let n = awal; n <= akhir; n++) {
  const h = hariBali(dariNomorHari(n));
  if (!h.sasih) continue;
  const bulan = h.tanggal.slice(0, 7);
  if (h.sasih.nampih) nampih.add(bulan);
  if (h.sasih.mala) mala.add(bulan);
  if (h.sasih.ngunaratri) skip.add(bulan);
}

// Sebaran merata: satu bulan tiap lima tahun.
for (let th = 1971; th <= 2099; th += 5) biasa.add(`${th}-0${(th % 9) + 1}`.replace(/-0(\d\d)/, "-$1"));

const ambilN = (s, n) => [...s].sort().filter((_, i, a) => i % Math.max(1, Math.ceil(a.length / n)) === 0).slice(0, n);

const pilih = [...new Set([
  ...ambilN(nampih, 8),
  ...ambilN(mala, 8),
  ...ambilN(skip, 8),
  ...ambilN(biasa, 10)
])].sort();

console.log(`nampih: ${nampih.size} bulan, mala: ${mala.size}, ngunaratri: ${skip.size}`);
console.log(`terpilih ${pilih.length} bulan: ${pilih.join(", ")}`);
writeFileSync(join(DIR, "crosscheck_bulan.json"), JSON.stringify(pilih));
console.log("  -> fixtures/crosscheck_bulan.json");
