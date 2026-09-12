import {
  WUKU, SAPTAWARA, PANCAWARA, TRIWARA, CATURWARA, SADWARA, ASTAWARA, SANGAWARA,
  DASAWARA, DWIWARA, URIP_SAPTAWARA, URIP_PANCAWARA, JEJEPAN, INGKEL_WUKU,
  PAWUKON_OFFSET, PANCAWARA_OFFSET
} from "./wewaran.js";
import tabel from "./data/tabel.js";
import sasihTabel from "./data/sasih.js";
import dewasaAturan from "./data/dewasa.js";
import { rerainan, hariPenting } from "./rerainan.js";
import { karyaAyu, karyaAyuBersama } from "./karya-ayu.js";

export { karyaAyu, karyaAyuBersama };

const MS_HARI = 86400000;

/** Nomor hari sejak 1970-01-01, dihitung di UTC agar bebas dari zona waktu. */
export function nomorHari(tanggal) {
  const d = toDate(tanggal);
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / MS_HARI);
}

export function dariNomorHari(n) {
  const d = new Date(n * MS_HARI);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function toDate(t) {
  if (t instanceof Date) return t;
  if (typeof t === "string") {
    const [y, m, d] = t.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  throw new TypeError("Tanggal harus Date atau string YYYY-MM-DD");
}

export function keIso(tanggal) {
  const d = toDate(tanggal);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* ---------------------------------------------------------------- pawukon */

/** Indeks hari dalam siklus pawukon 210 hari (0 = Redite wuku Sinta). */
export function indeksPawukon(n) {
  return ((n + PAWUKON_OFFSET) % 210 + 210) % 210;
}

// Caturwara dan astawara "berhenti" tiga hari di p = 70, 71, 72.
function indeksEfektif(p) {
  if (p <= 70) return p;
  if (p <= 72) return 70;
  return p - 2;
}

export function wewaran(n) {
  const p = indeksPawukon(n);
  const e = indeksEfektif(p);
  const saptawara = SAPTAWARA[p % 7];
  const pancawara = PANCAWARA[(((n + PANCAWARA_OFFSET) % 5) + 5) % 5];
  const uripSapta = URIP_SAPTAWARA[saptawara];
  const uripPanca = URIP_PANCAWARA[pancawara];
  const jumlahUrip = uripSapta + uripPanca;

  return {
    ekawara: jumlahUrip % 2 === 1 ? "Luang" : "-",
    dwiwara: DWIWARA[jumlahUrip % 2],
    triwara: TRIWARA[p % 3],
    caturwara: CATURWARA[e % 4],
    pancawara,
    sadwara: SADWARA[p % 6],
    saptawara,
    astawara: ASTAWARA[e % 8],
    sangawara: SANGAWARA[(p < 3 ? 0 : p - 3) % 9],
    dasawara: DASAWARA[jumlahUrip % 10],
    urip: { saptawara: uripSapta, pancawara: uripPanca, jumlah: jumlahUrip }
  };
}

/* ------------------------------------------------------------------ sasih */

// Tabel sasih disusun dari anchor purnama-tilem kalenderbali.org 1970-2100.
// `gaps` berisi jarak antar peristiwa (14 atau 15 hari); jarak 14 berarti ada
// satu angka penanggal/pangelong yang dilewati (ngunaratri), posisinya di `skip`.
const HARI_PERISTIWA = (() => {
  const mulai = nomorHari(sasihTabel.epoch);
  const out = new Array(sasihTabel.gaps.length + 1);
  out[0] = mulai;
  for (let i = 0; i < sasihTabel.gaps.length; i++) out[i + 1] = out[i] + sasihTabel.gaps[i];
  return out;
})();

export const RENTANG_DIDUKUNG = {
  mulai: dariNomorHari(HARI_PERISTIWA[0] + 1),
  selesai: dariNomorHari(HARI_PERISTIWA[HARI_PERISTIWA.length - 1])
};

function cariPeristiwa(n) {
  let lo = 0;
  let hi = HARI_PERISTIWA.length - 1;
  if (n <= HARI_PERISTIWA[0] || n > HARI_PERISTIWA[hi]) return -1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (HARI_PERISTIWA[mid] < n) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// Awal tiap unit sasih (label bisa berpindah di hari Tilem, tergantung era
// penanggalan yang dipakai kalenderbali.org), jadi nama sasih dicari terpisah
// dari perhitungan penanggal/pangelong.
const AWAL_UNIT = sasihTabel.unitAwal.map((d) => nomorHari(sasihTabel.epoch) + d);

function cariUnit(n) {
  let lo = 0;
  let hi = AWAL_UNIT.length - 1;
  if (n < AWAL_UNIT[0]) return -1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (AWAL_UNIT[mid] <= n) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export function sasih(n) {
  const i = cariPeristiwa(n);
  const u = cariUnit(n);
  if (i < 0 || u < 0) return null;

  const fasePurnama = (sasihTabel.kindPertama + i) % 2 === 0;
  const k = n - HARI_PERISTIWA[i - 1];
  const dilewati = sasihTabel.skip[i];
  const angka = dilewati > 0 && k >= dilewati ? k + 1 : k;

  const nama = sasihTabel.sasihNama[sasihTabel.unitSasih[u]];
  const awalan = ["", "Mala ", "Nampih "][sasihTabel.unitPrefix[u]];
  const purnama = fasePurnama && angka === 15;
  const tilem = !fasePurnama && angka === 15;

  return {
    nama: awalan + nama,
    namaDasar: nama,
    indeks: sasihTabel.unitSasih[u],
    mala: sasihTabel.unitPrefix[u] === 1,
    nampih: sasihTabel.unitPrefix[u] === 2,
    fase: fasePurnama ? "penanggal" : "pangelong",
    angka,
    purnama,
    tilem,
    tithi: fasePurnama ? angka : angka + 15,
    label: purnama ? "Purnama" : tilem ? "Tilem" : `${fasePurnama ? "Penanggal" : "Pangelong"} ${angka}`,
    ngunaratri: dilewati > 0
  };
}

export function tahunSaka(n) {
  const daftar = sasihTabel.awalSaka;
  let hasil = null;
  for (let i = 0; i < daftar.length; i += 2) {
    if (n >= nomorHari(sasihTabel.epoch) + daftar[i]) hasil = daftar[i + 1];
    else break;
  }
  return hasil;
}

/* ----------------------------------------------------------------- dewasa */

function cocokKondisi(kondisi, hari) {
  switch (kondisi.t) {
    case "wara": {
      if (kondisi.cycle === "wuku") return hari.wuku.nama === kondisi.v;
      if (kondisi.cycle === "sasih") return hari.sasih?.namaDasar === kondisi.v;
      return hari.wewaran[kondisi.cycle] === kondisi.v;
    }
    case "tithi":
      return hari.sasih?.fase === kondisi.phase && hari.sasih?.angka === kondisi.n;
    case "phase":
      // "Penanggal"/"Pangelong" tanpa angka tidak mencakup Purnama maupun Tilem.
      return hari.sasih?.fase === kondisi.phase && hari.sasih?.angka !== 15;
    case "tithi_eq_sasih":
      return hari.sasih?.fase === kondisi.phase && hari.sasih?.angka === hari.sasih?.indeks + 1;
    default:
      return false;
  }
}

/** Semua ala-ayuning dewasa yang berlaku pada satu hari. */
export function dewasaHari(hari) {
  const hasil = [];
  for (const aturan of dewasaAturan) {
    // Sebagian aturan diberi alahing berbeda tergantung kalimat pola mana yang
    // cocok, jadi yang dipakai adalah bobot kalimat yang benar-benar kena hari ini.
    // Kalau beberapa kalimat cocok sekaligus, kalenderbali.org memakai yang
    // terberat — diuji pada Agni Agung Doyan Basmi, 22 April 1997.
    const cocok = [];
    aturan.kondisi.forEach((kalimat, i) => {
      if (kalimat.every((k) => cocokKondisi(k, hari))) cocok.push(i);
    });
    if (cocok.length === 0) continue;
    const bobotCocok = cocok.map((i) => aturan.alahingPola?.[i]).filter((x) => x != null);
    hasil.push({
      nama: aturan.nama,
      penjelasan: aturan.penjelasan,
      baik: aturan.baik,
      buruk: aturan.buruk,
      baikUntuk: aturan.baikUntuk,
      burukUntuk: aturan.burukUntuk,
      alahing: bobotCocok.length ? Math.max(...bobotCocok) : aturan.alahing,
      alahingVarian: aturan.alahingVarian,
      polaCocok: cocok,
      polaRaw: aturan.polaRaw,
      tag: aturan.tag
    });
  }
  return hasil.sort((a, b) => a.nama.localeCompare(b.nama, "id"));
}

/* -------------------------------------------------------------- hari bali */

/** Seluruh perhitungan kalender Bali untuk satu tanggal Masehi. */
export function hariBali(tanggal) {
  const d = toDate(tanggal);
  const n = nomorHari(d);
  const p = indeksPawukon(n);
  const iWuku = Math.floor(p / 7);
  const w = wewaran(n);
  const s = sasih(n);
  const i35 = SAPTAWARA.indexOf(w.saptawara) * 5 + PANCAWARA.indexOf(w.pancawara);

  const hari = {
    tanggal: keIso(d),
    masehi: { tahun: d.getFullYear(), bulan: d.getMonth() + 1, hari: d.getDate(), hariMinggu: d.getDay() },
    nomorHari: n,
    pawukon: p,
    // Wewukon: sifat yang melekat pada wuku, bukan pada hari — lihat README.
    wuku: { nama: WUKU[iWuku], indeks: iWuku, bhatara: tabel.bhatara[iWuku],
            wewukon: tabel.wewukon[iWuku] },
    wewaran: w,
    sasih: s,
    saka: tahunSaka(n),
    // Dauh ayu: rentang jam baik dalam sehari, ditentukan saptawara.
    dauhAyu: tabel.dauhAyu[w.saptawara],
    ingkelJejepan: JEJEPAN[w.sadwara],
    ingkelWuku: INGKEL_WUKU[iWuku % 6],
    watek: tabel.watek[i35],
    lintang: tabel.lintang[i35],
    pararasan: tabel.pararasan[i35],
    pancasuda: tabel.pancasuda[i35],
    ekajalaresi: tabel.ekajalaresi[p],
    pratiti: s ? tabel.pratiti.urutan[tabel.pratiti.grid[s.tithi - 1][s.indeks]] : null
  };

  hari.dewasa = s ? dewasaHari(hari) : [];
  hari.rerainan = rerainan(hari, (delta) => sasih(n + delta));
  hari.hariPenting = hariPenting(hari);
  return hari;
}

/** Deret hariBali untuk rentang tanggal (inklusif). */
export function rentangHariBali(mulai, selesai) {
  const a = nomorHari(mulai);
  const b = nomorHari(selesai);
  const out = [];
  for (let n = a; n <= b; n++) out.push(hariBali(dariNomorHari(n)));
  return out;
}

/* ---------------------------------------------------------------- otonan */

export const SIKLUS_PAWUKON = 210;

/**
 * Otonan: hari lahir menurut pawukon, berulang tiap 210 hari.
 * Mengembalikan `jumlah` otonan berikutnya terhitung dari `sejak`.
 */
export function otonan(tanggalLahir, { jumlah = 6, sejak = new Date() } = {}) {
  const lahir = nomorHari(tanggalLahir);
  const dari = nomorHari(sejak);
  const lewat = Math.max(0, Math.ceil((dari - lahir) / SIKLUS_PAWUKON));
  const out = [];
  for (let i = 0; i < jumlah; i++) {
    const n = lahir + (lewat + i) * SIKLUS_PAWUKON;
    out.push({ ke: lewat + i, ...hariBali(dariNomorHari(n)) });
  }
  return { lahir: hariBali(tanggalLahir), berikutnya: out };
}

/* --------------------------------------------------------- cari hari baik */

export const KEPERLUAN = {
  pernikahan: "Pernikahan (pawiwahan)",
  yadnya: "Upacara / yadnya",
  bangunan: "Membangun & rumah",
  usaha: "Usaha & dagang",
  pertanian: "Pertanian",
  ternak: "Ternak & perikanan",
  perjalanan: "Bepergian & pindah",
  pendidikan: "Belajar & berlatih",
  manusa_yadnya: "Manusa yadnya (potong gigi/rambut)",
  pitra_yadnya: "Pitra yadnya (ngaben)",
  pertemuan: "Pertemuan & rapat",
  peralatan: "Peralatan & senjata",
  jabatan: "Pelantikan & aturan"
};

const BOBOT_DEFAULT = 3;

// `alahing` sudah diselesaikan per-pola oleh dewasaHari(); default hanya terpakai
// untuk aturan yang bobotnya memang belum pernah terlihat di situs sumber.
function bobot(d) {
  return d.alahing ?? BOBOT_DEFAULT;
}

/**
 * Ringkas ala-ayu satu hari. Praktik wariga sebagian besar bersifat eliminasi:
 * yang dihindari lebih dulu adalah dewasa ala untuk keperluan itu (`penghalang`),
 * baru sesudahnya dilihat dewasa yang mendukung (`pendukung`).
 */
export function nilaiHari(hari, keperluan = null) {
  const pendukung = [];
  const penghalang = [];
  const umumAyu = [];
  const umumAla = [];
  for (const d of hari.dewasa) {
    const b = bobot(d);
    const item = { ...d, bobot: b };
    if (keperluan) {
      if (d.baikUntuk?.includes(keperluan)) pendukung.push(item);
      if (d.burukUntuk?.includes(keperluan)) penghalang.push(item);
    }
    if (d.baik) umumAyu.push(item);
    if (d.buruk) umumAla.push(item);
  }
  const nilaiDukung = pendukung.reduce((s, d) => s + d.bobot, 0);
  const nilaiHalang = penghalang.reduce((s, d) => s + d.bobot, 0);
  const nilaiUmum = umumAyu.reduce((s, d) => s + d.bobot, 0) - umumAla.reduce((s, d) => s + d.bobot, 0);
  const kriteria = keperluan === "pernikahan" ? kriteriaPawiwahan(hari) : null;
  return {
    pendukung, penghalang, umumAyu, umumAla, kriteria,
    nilaiDukung, nilaiHalang, nilaiUmum,
    bersih: penghalang.length === 0,
    skor: nilaiDukung - nilaiHalang + (kriteria ? kriteria.jumlahCocok * 2 : 0)
  };
}

/**
 * Cari hari baik pada satu rentang tanggal.
 * Hari tanpa penghalang selalu diurutkan di atas hari yang punya penghalang.
 *
 * `otonan` opsional: daftar tanggal lahir (mis. dua mempelai). Kalau diisi, tiap
 * hari juga dinilai dengan Karya Ayu terhadap kelahiran itu, dan hasilnya
 * dilaporkan di `nilai.karyaAyu` — terpisah dari ala-ayuning dewasa, karena
 * memang aturan yang berbeda. Tanpa `otonan`, keluaran fungsi ini persis sama
 * seperti sebelum parameter ini ada.
 */
export function cariHariBaik(
  mulai, selesai,
  { keperluan = null, tanpaAla = false, batas = 0, otonan: tanggalLahir = null, otonanWajib = false } = {}
) {
  const lahir = (tanggalLahir ?? []).filter(Boolean).map((t) => hariBali(t));
  const hasil = [];
  for (const hari of rentangHariBali(mulai, selesai)) {
    const nilai = nilaiHari(hari, keperluan);
    if (tanpaAla && !nilai.bersih) continue;
    if (lahir.length) {
      nilai.karyaAyu = karyaAyuBersama(lahir, hari);
      if (otonanWajib && !nilai.karyaAyu.bersih) continue;
    }
    hasil.push({ ...hari, nilai });
  }
  hasil.sort((a, b) =>
    Number(b.nilai.bersih) - Number(a.nilai.bersih) ||
    (b.nilai.karyaAyu?.jumlahBaik ?? 0) - (a.nilai.karyaAyu?.jumlahBaik ?? 0) ||
    b.nilai.skor - a.nilai.skor ||
    b.nilai.nilaiUmum - a.nilai.nilaiUmum ||
    a.nomorHari - b.nomorHari
  );
  return batas > 0 ? hasil.slice(0, batas) : hasil;
}

/* ----------------------------------------------------- kriteria pawiwahan */

// Kriteria umum pawiwahan yang dirangkum di /dewasa-ayu/pernikahan. Ini lapisan
// terpisah dari ala-ayuning dewasa: sifatnya anjuran umum, bukan aturan bernama.
const SAPTAWARA_PAWIWAHAN = ["Soma", "Buda", "Wraspati", "Sukra"];
const PENANGGAL_PAWIWAHAN = [1, 2, 10, 13];
const SASIH_PAWIWAHAN = ["Ketiga", "Kapat", "Kelima", "Kepitu", "Kedasa"];

export function kriteriaPawiwahan(hari) {
  const cocok = [];
  const belum = [];
  const s = hari.sasih;

  (SAPTAWARA_PAWIWAHAN.includes(hari.wewaran.saptawara) ? cocok : belum)
    .push(`Saptawara ${hari.wewaran.saptawara}`);

  const penanggalCocok = s?.fase === "penanggal" && PENANGGAL_PAWIWAHAN.includes(s.angka);
  (penanggalCocok ? cocok : belum).push(s ? s.label : "Penanggal tidak diketahui");

  (SASIH_PAWIWAHAN.includes(s?.namaDasar) ? cocok : belum).push(`Sasih ${s?.nama ?? "-"}`);

  return { cocok, belum, jumlahCocok: cocok.length };
}
