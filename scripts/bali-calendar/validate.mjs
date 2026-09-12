import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { hariBali, karyaAyu } from "../../lib/bali-calendar/index.js";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

const gtDay = JSON.parse(readFileSync(join(DIR, "gt_day.json"), "utf8"));
const gtPaw = JSON.parse(readFileSync(join(DIR, "gt_pawukon.json"), "utf8"));
const gtAla = JSON.parse(readFileSync(join(DIR, "gt_alaayu.json"), "utf8"));

let n = 0, fails = {};
const fail = (k, f, exp, got) => {
  fails[f] = fails[f] || [];
  if (fails[f].length < 4) fails[f].push(`${k}: exp=${JSON.stringify(exp)} got=${JSON.stringify(got)}`);
  fails[f].count = (fails[f].count || 0) + 1;
};

const MAP = {
  "Eka Wara": (h) => h.wewaran.ekawara, "Dwi Wara": (h) => h.wewaran.dwiwara,
  "Tri Wara": (h) => h.wewaran.triwara, "Catur Wara": (h) => h.wewaran.caturwara,
  "Panca Wara": (h) => h.wewaran.pancawara, "Sad Wara": (h) => h.wewaran.sadwara,
  "Sapta Wara": (h) => h.wewaran.saptawara, "Asta Wara": (h) => h.wewaran.astawara,
  "Sanga Wara": (h) => h.wewaran.sangawara, "Dasa Wara": (h) => h.wewaran.dasawara,
  "Lintang": (h) => h.lintang, "Pararasan": (h) => h.pararasan, "Panca Suda": (h) => h.pancasuda,
  "Watek": (h) => h.watek, "Eka Jala Resi": (h) => h.ekajalaresi,
  "Pratiti Samut Pada": (h) => h.pratiti, "Ingkel Jejepan": (h) => h.ingkelJejepan,
  "Penanggal": (h) => h.sasih.label, "Sasih": (h) => h.sasih.nama
};

for (const [k, r] of Object.entries(gtDay)) {
  const h = hariBali(k); n++;
  for (const [f, get] of Object.entries(MAP)) if (get(h) !== r[f]) fail(k, f, r[f], get(h));
  const urip = `Urip = ${h.wewaran.urip.saptawara} + ${h.wewaran.urip.pancawara}`;
  if (urip !== r["Urip Sapta Wara + Panca Wara"]) fail(k, "urip", r["Urip Sapta Wara + Panca Wara"], urip);
  const wewukon = JSON.stringify(h.wuku.wewukon);
  if (wewukon !== JSON.stringify(r.Wewukon ?? [])) fail(k, "Wewukon", r.Wewukon, h.wuku.wewukon);
}
console.log(`== detail harian: ${n} hari ==`);
for (const [f, v] of Object.entries(fails)) console.log(`  ${f}: ${v.count} salah | ${v.slice(0, 2).join(" ; ")}`);
if (!Object.keys(fails).length) console.log("  semua cocok");

let pn = 0, pbad = 0;
for (const [k, [s, p, w]] of Object.entries(gtPaw)) {
  const h = hariBali(k); pn++;
  if (h.wewaran.saptawara !== s || h.wewaran.pancawara !== p || h.wuku.nama !== w) {
    if (pbad < 3) console.log("  PAWUKON", k, [s, p, w], [h.wewaran.saptawara, h.wewaran.pancawara, h.wuku.nama]);
    pbad++;
  }
}
console.log(`== pawukon 1970-2100: ${pn - pbad}/${pn} cocok ==`);

// gt_alaayu.json: { tanggal: [[nama, alahing], ...] } untuk dua tahun penuh
// (2026 dan 1997 — era batas sasih yang berbeda) plus tanggal probe terarah.
let an = 0, exact = 0, missing = new Map(), extra = new Map();
let bn = 0, bbad = 0;
const bbeda = [];
const tahunPenuh = new Set();
for (const [k, rows] of Object.entries(gtAla)) {
  const dewasa = hariBali(k).dewasa;
  const got = dewasa.map((d) => d.nama).sort();
  // Situs kadang menampilkan satu dewasa dua kali kalau polanya tertulis dobel;
  // mesin ini menggabungkannya, jadi dibandingkan sebagai himpunan.
  const exp = [...new Set(rows.map((r) => r[0]))].sort(); an++;
  tahunPenuh.add(k.slice(0, 4));

  // Bobot alahing: hanya diuji untuk dewasa yang memang muncul di kedua sisi.
  // Kalau situs menampilkan satu nama dua kali (polanya memang tertulis dobel dan
  // keduanya kena), bobot kita cukup cocok dengan salah satunya.
  const perNama = new Map();
  for (const [nama, angka] of rows) {
    if (!perNama.has(nama)) perNama.set(nama, []);
    perNama.get(nama).push(angka);
  }
  for (const [nama, angka] of perNama) {
    const d = dewasa.find((x) => x.nama === nama);
    if (!d) continue;
    bn++;
    if (!angka.includes(d.alahing)) {
      bbad++;
      if (bbeda.length < 6) bbeda.push(`${k} ${nama}: situs=${angka.join("/")} kita=${d.alahing}`);
    }
  }

  if (JSON.stringify(got) === JSON.stringify(exp)) { exact++; continue; }
  for (const x of exp) if (!got.includes(x)) missing.set(x, (missing.get(x) || 0) + 1);
  for (const x of got) if (!exp.includes(x)) extra.set(x, (extra.get(x) || 0) + 1);
}
console.log(`== ala-ayuning dewasa: ${exact}/${an} hari sama persis (${[...tahunPenuh].sort().join(", ")}) ==`);
const top = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${k}(${v})`).join(", ");
if (missing.size) console.log("  KURANG:", top(missing));
if (extra.size) console.log("  LEBIH :", top(extra));
console.log(`== alahing dewasa: ${bn - bbad}/${bn} bobot cocok ==`);
for (const b of bbeda) console.log("  BEDA " + b);
if (!bbad) console.log("  semua cocok");

// Spot check: 30 tanggal acak 1970-2100 yang tidak dipakai saat menyusun tabel,
// dibandingkan dengan keluaran langsung kalenderbali.org (disimpan di fixtures).
const spot = JSON.parse(readFileSync(join(DIR, "spot.json"), "utf8"));
let sn = 0, sbad = 0;
for (const [k, v] of Object.entries(spot)) {
  const h = hariBali(k);
  const got = {
    penanggal: h.sasih.label, sasih: h.sasih.nama, sapta: h.wewaran.saptawara,
    panca: h.wewaran.pancawara, asta: h.wewaran.astawara, sanga: h.wewaran.sangawara,
    pratiti: h.pratiti, lintang: h.lintang
  };
  for (const f of Object.keys(v)) {
    sn++;
    if (v[f] !== got[f]) { sbad++; console.log("  BEDA", k, f, "situs:", v[f], "kita:", got[f]); }
  }
}
console.log(`== spot check 30 tanggal acak: ${sn - sbad}/${sn} field cocok ==`);

// Rerainan & hari penting: dibandingkan terhadap daftar bulanan kalenderbali.org
// untuk seluruh 18 tahun sampel (lintas tiga era penanggalan).
const gtRer = JSON.parse(readFileSync(join(DIR, "gt_rerainan.json"), "utf8"));
const gtPen = JSON.parse(readFileSync(join(DIR, "gt_haripenting.json"), "utf8"));
const TAHUN_SAMPEL = [...new Set(Object.keys(gtRer).map((t) => Number(t.slice(0, 4))))].sort();

// Situs sumber menulis "Kaleng Keliwon" pada penanggal 8; itu salah ketik di sana.
const rapikan = (n) => n.replace(/^Kaleng Keliwon\b/, "Kajeng Keliwon");

function bandingHarian(gt, ambil, judul) {
  let hari = 0, sama = 0;
  const kurang = new Map(), lebih = new Map(), beda = [];
  for (const th of TAHUN_SAMPEL) {
    for (let d = new Date(th, 0, 1); d.getFullYear() === th; d.setDate(d.getDate() + 1)) {
      const iso = `${th}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const exp = [...new Set((gt[iso] ?? []).map(rapikan))].sort();
      const got = [...new Set(ambil(hariBali(iso)))].sort();
      hari++;
      if (JSON.stringify(exp) === JSON.stringify(got)) { sama++; continue; }
      for (const x of exp) if (!got.includes(x)) kurang.set(x, (kurang.get(x) || 0) + 1);
      for (const x of got) if (!exp.includes(x)) lebih.set(x, (lebih.get(x) || 0) + 1);
      const h = hariBali(iso);
      beda.push(`${iso} [${h.sasih ? h.sasih.nama + " " + h.sasih.label : "luar rentang"}] situs=${JSON.stringify(exp)} kita=${JSON.stringify(got)}`);
    }
  }
  console.log(`== ${judul}: ${sama}/${hari} hari sama persis (${TAHUN_SAMPEL.length} tahun sampel) ==`);
  if (kurang.size) console.log("  KURANG:", top(kurang));
  if (lebih.size) console.log("  LEBIH :", top(lebih));
  // Sisa selisih ditampilkan per tanggal selama masih sedikit, supaya regresi baru
  // langsung kelihatan dan tidak tenggelam di balik angka ringkasan.
  if (beda.length && beda.length <= 12) for (const b of beda) console.log("    " + b);
  if (!kurang.size && !lebih.size) console.log("  semua cocok");
}

bandingHarian(gtRer, (h) => h.rerainan.map((r) => r.nama), "rerainan");
bandingHarian(gtPen, (h) => h.hariPenting.map((r) => r.nama), "hari penting nasional");

// Karya Ayu: kategori hari menurut tanggal lahir (aturan urip mod 4).
const gtKarya = JSON.parse(readFileSync(join(DIR, "gt_karyaayu.json"), "utf8"));
let kn = 0, kbad = 0;
const kbeda = [];
for (const [lahir, rows] of Object.entries(gtKarya)) {
  const L = hariBali(lahir);
  for (const [iso, [kategori, nilai]] of Object.entries(rows)) {
    const got = karyaAyu(L, hariBali(iso));
    kn++;
    const nilaiHarap = got.baik ? "Baik" : "Tidak Baik";
    if (got.kategori !== kategori || nilaiHarap !== nilai) {
      kbad++;
      if (kbeda.length < 4) kbeda.push(`${lahir} @ ${iso}: situs=${kategori}/${nilai} kita=${got.kategori}/${nilaiHarap}`);
    }
  }
}
console.log(`== karya ayu: ${kn - kbad}/${kn} hari cocok (${Object.keys(gtKarya).length} tanggal lahir) ==`);
for (const b of kbeda) console.log("  BEDA " + b);
if (!kbad) console.log("  semua cocok");

// ---- Tahap 4: pembandingan dengan sumber kedua (kalenderbali.com) ----
// Catatan penting: kalenderbali.com dan kalenderbali.org disusun orang yang sama
// (I Wayan Nuarsa, Universitas Udayana), jadi kesepakatan keduanya BUKAN bukti
// kebenaran — ini menguji apakah dua penyajian dari penerbit yang sama konsisten,
// bukan apakah dua tradisi sepakat.
const gtCom = JSON.parse(readFileSync(join(DIR, "gt_kbcom.json"), "utf8"));
const BANDING = {
  "Eka Wara": (h) => h.wewaran.ekawara, "Dwi Wara": (h) => h.wewaran.dwiwara,
  "Tri Wara": (h) => h.wewaran.triwara, "Catur Wara": (h) => h.wewaran.caturwara,
  "Panca Wara": (h) => h.wewaran.pancawara, "Sad Wara": (h) => h.wewaran.sadwara,
  "Sapta Wara": (h) => h.wewaran.saptawara, "Asta Wara": (h) => h.wewaran.astawara,
  "Sanga Wara": (h) => h.wewaran.sangawara, "Dasa Wara": (h) => h.wewaran.dasawara,
  "Ingkel Jejepan": (h) => h.ingkelJejepan, "Pararasan": (h) => h.pararasan,
  "Lintang": (h) => h.lintang, "Panca Suda": (h) => h.pancasuda,
  "Ekajalaresi": (h) => h.ekajalaresi, "Pratiti Samutpada": (h) => h.pratiti,
  "Sasih": (h) => h.sasih?.nama,
  "Penanggal/Pangelong": (h) => h.sasih?.angka,
  "Urip (Sapta+Panca)": (h) => `Urip = ${h.wewaran.urip.saptawara} + ${h.wewaran.urip.pancawara}`
};
// kalenderbali.com menulis hari ngunaratri sebagai pasangan angka ("6/7") —
// angka yang dilewati dan angka yang dipakai — sementara kalenderbali.org hanya
// menulis yang dipakai. Itu beda penulisan, bukan beda kalender, jadi pasangan
// dianggap cocok kalau angka kita salah satu dari keduanya.
const samaAngka = (kita, com) => {
  const s = String(com);
  const pasangan = s.match(/^(\d+)\/(\d+)$/);
  if (pasangan) return String(kita) === pasangan[1] || String(kita) === pasangan[2];
  return String(kita) === s;
};

const cn = new Map(), cbad = new Map(), ccontoh = new Map();
const luarRentang = [];
const catatan = [];
for (const [iso, rec] of Object.entries(gtCom)) {
  const h = hariBali(iso);
  if (!h.sasih) { luarRentang.push(iso); continue; }
  for (const [f, get] of Object.entries(BANDING)) {
    if (!(f in rec)) continue;
    cn.set(f, (cn.get(f) || 0) + 1);
    const cocok = f === "Penanggal/Pangelong"
      ? samaAngka(get(h), rec[f])
      : String(get(h)) === String(rec[f]);
    if (cocok) continue;
    cbad.set(f, (cbad.get(f) || 0) + 1);
    catatan.push(`${iso} ${f}: .com=${rec[f]} kita=${get(h)} (${h.sasih.nama} ${h.sasih.label})`);
    if (!ccontoh.has(f)) ccontoh.set(f, `${iso}: .com=${rec[f]} kita=${get(h)}`);
  }
}
const totalN = [...cn.values()].reduce((a, b) => a + b, 0);
const totalBad = [...cbad.values()].reduce((a, b) => a + b, 0);
console.log(`== sumber kedua (kalenderbali.com): ${totalN - totalBad}/${totalN} field cocok ` +
  `(${Object.keys(gtCom).length} hari, 33 bulan terpilih di nampih/mala sasih & ngunaratri) ==`);
for (const [f, salah] of [...cbad].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${f}: ${salah}/${cn.get(f)} beda | ${ccontoh.get(f)}`);
}
if (!cbad.size) console.log("  semua field cocok");
if (luarRentang.length) {
  console.log(`  ${luarRentang.length} hari dilewati karena di luar rentang sasih yang didukung ` +
    `(${luarRentang[0]}..${luarRentang[luarRentang.length - 1]})`);
}
// Sisa selisih ditampilkan utuh: kalau dua sumber memang berbeda di suatu tanggal,
// itu harus kelihatan, bukan disembunyikan di balik satu angka ringkasan.
for (const c of catatan) console.log("    " + c);

// Dauh ayu: tabel tujuh sel, diuji ulang terhadap bulan-bulan sampel yang dipanen.
const gtDauh = JSON.parse(readFileSync(join(DIR, "dauh_ayu.json"), "utf8"));
let dn = 0, dbad = 0;
for (const [th, bl] of [[2026, 9], [2026, 1], [1997, 6], [2050, 3]]) {
  for (let d = new Date(th, bl - 1, 1); d.getMonth() === bl - 1; d.setDate(d.getDate() + 1)) {
    const h = hariBali(new Date(d));
    dn++;
    if (JSON.stringify(h.dauhAyu) !== JSON.stringify(gtDauh[h.wewaran.saptawara])) dbad++;
  }
}
console.log(`== dauh ayu: ${dn - dbad}/${dn} hari cocok (7 saptawara, 4 bulan lintas musim & era) ==`);
if (!dbad) console.log("  semua cocok");

// ---- Tahap 4: sumber ketiga yang independen (kalenderbali.info) ----
// Disusun I K. Suwintana (2013) dan tidak merujuk KBD sama sekali. Ini satu-
// satunya pembanding yang benar-benar independen: kalenderbali.com dan .org
// sama-sama karya I Wayan Nuarsa, jadi kesepakatan keduanya tidak membuktikan
// apa pun tentang kebenaran.
const gtInfo = JSON.parse(readFileSync(join(DIR, "gt_kbinfo.json"), "utf8"));

// Kedua situs menamai hal yang sama dengan ejaan berbeda. Ini disamakan lebih
// dulu supaya yang tersisa benar-benar selisih kalender, bukan selisih ejaan.
const EJAAN = {
  // sasih
  Kapitu: "Kepitu", Katiga: "Ketiga", Kalima: "Kelima", Kanem: "Kenam",
  Kawulu: "Kewulu", Kaulu: "Kewulu", Kasanga: "Kesanga", Kadasa: "Kedasa",
  Jiestha: "Jiyestha", Jyestha: "Jiyestha", Destha: "Jiyestha",
  // pancawara & sangawara
  Kliwon: "Keliwon", Urukung: "Urungan",
  // wuku
  Dungulan: "Dunggulan", Kelawu: "Kulawu", Klawu: "Kulawu"
};
const samakan = (s) => String(s).split(" ").map((w) => EJAAN[w] ?? w).join(" ");

const BANDING3 = {
  saptawara: (h) => h.wewaran.saptawara,
  pancawara: (h) => h.wewaran.pancawara,
  triwara: (h) => h.wewaran.triwara,
  caturwara: (h) => h.wewaran.caturwara,
  sadwara: (h) => h.wewaran.sadwara,
  astawara: (h) => h.wewaran.astawara,
  sangawara: (h) => h.wewaran.sangawara,
  dasawara: (h) => h.wewaran.dasawara,
  dwiwara: (h) => h.wewaran.dwiwara,
  ekawara: (h) => (h.wewaran.ekawara === "-" ? "--" : h.wewaran.ekawara),
  wuku: (h) => h.wuku.nama,
  sasih: (h) => h.sasih.nama,
  penanggal: (h) => String(h.sasih.angka),
  urip: (h) => `Urip=${h.wewaran.urip.saptawara}+${h.wewaran.urip.pancawara}`
};

const i3n = new Map(), i3bad = new Map(), i3beda = [];
for (const [iso, rec] of Object.entries(gtInfo)) {
  const h = hariBali(iso);
  if (!h.sasih) continue;
  for (const [f, get] of Object.entries(BANDING3)) {
    i3n.set(f, (i3n.get(f) || 0) + 1);
    if (samakan(get(h)) === samakan(rec[f])) continue;
    i3bad.set(f, (i3bad.get(f) || 0) + 1);
    i3beda.push(`${iso} ${f}: .info=${rec[f]} kita=${get(h)} (${h.sasih.nama} ${h.sasih.label})`);
  }
}
const t3 = [...i3n.values()].reduce((a, b) => a + b, 0);
const b3 = [...i3bad.values()].reduce((a, b) => a + b, 0);
console.log(`== sumber ketiga, independen (kalenderbali.info): ${t3 - b3}/${t3} field cocok ` +
  `(${Object.keys(gtInfo).length} tanggal terpilih di nampih/mala sasih, ngunaratri, purnama-tilem) ==`);
for (const [f, salah] of [...i3bad].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${f}: ${salah}/${i3n.get(f)} beda`);
}
// Selisih ditampilkan utuh selama masih sedikit: kalau dua tradisi memang
// berbeda di suatu tanggal, itu harus kelihatan, bukan disembunyikan.
if (i3beda.length && i3beda.length <= 20) for (const b of i3beda) console.log("    " + b);
if (!b3) console.log("  semua cocok");

// Sampelnya sengaja berat di kasus langka, jadi angka gabungan di atas tidak
// mewakili tanggal acak. Rincian per kelompok yang menjawab pertanyaannya:
// di mana dua kalender ini sepakat, dan di mana tidak.
const kelompok3 = (h) => h.sasih.nampih ? "nampih sasih" : h.sasih.mala ? "mala sasih"
  : h.sasih.ngunaratri ? "ngunaratri" : (h.sasih.purnama || h.sasih.tilem) ? "purnama/tilem" : "hari biasa";
const rinci = new Map();
for (const [iso, rec] of Object.entries(gtInfo)) {
  const h = hariBali(iso);
  if (!h.sasih) continue;
  const k = kelompok3(h);
  if (!rinci.has(k)) rinci.set(k, { n: 0, sasih: 0, geser: 0 });
  const e = rinci.get(k);
  e.n++;
  if (samakan(rec.sasih) !== samakan(h.sasih.nama)) {
    e.sasih++;
    // Penanggal sama tapi nama sasih beda = pergeseran penamaan, bukan
    // perhitungan bulan yang berbeda.
    if (String(rec.penanggal) === String(h.sasih.angka)) e.geser++;
  }
}
console.log("  rincian sasih per kelompok (n | beda | di antaranya cuma bergeser nama):");
for (const [k, e] of [...rinci].sort()) {
  console.log(`    ${k.padEnd(15)} ${String(e.n).padStart(3)} | ${String(e.sasih).padStart(4)} | ${String(e.geser).padStart(4)}`);
}
const pakaiNampih = Object.values(gtInfo).filter((r) => /Nampih/i.test(r.sasih)).length;
console.log(`  kalenderbali.info tidak memakai label "Nampih" sama sekali ` +
  `(${pakaiNampih}/${Object.keys(gtInfo).length} tanggal sampel)`);
