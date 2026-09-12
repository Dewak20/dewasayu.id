# Mesin Kalender Bali

Perhitungan kalender Bali untuk proyek ini: pawukon, wewaran, sasih, dan
ala-ayuning dewasa. Tidak ada dependensi eksternal — seluruhnya JS biasa plus
tabel data yang dibangkitkan ulang lewat `scripts/bali-calendar/`.

## Cara pakai

```js
import { hariBali, cariHariBaik, otonan } from "@/lib/bali-calendar";

const h = hariBali("2026-09-12");
h.rerainan;           // [{ nama: "Tumpek Kandang", jenis: "tumpek", sumber: "pawukon" }, ...]
h.hariPenting;        // [{ nama: "Hari Polwan", jenis: "nasional", sumber: "masehi" }, ...]
h.wewaran.saptawara;  // "Saniscara"
h.wuku.nama;          // "Menail"
h.sasih.label;        // "Penanggal 1"
h.sasih.nama;         // "Kapat"
h.saka;               // 1948
h.dewasa;             // [{ nama: "Catur Laba", penjelasan, alahing, ... }, ...]

cariHariBaik("2027-06-01", "2027-09-30", {
  keperluan: "pernikahan",
  tanpaAla: true,
  otonan: ["1995-03-17", "1996-11-02"]   // opsional — hitungan Karya Ayu
});
otonan("1995-03-17", { jumlah: 6 });
```

## Yang dihitung dengan rumus vs yang pakai tabel

**Rumus murni** (berlaku untuk tanggal berapa pun):

| Bagian | Aturan |
|---|---|
| Indeks pawukon | `(hari sejak 1970-01-01 + 32) mod 210` |
| Wuku | `WUKU[indeks / 7]` |
| Saptawara, triwara, sadwara | `indeks mod 7 / 3 / 6` |
| Pancawara | `(hari sejak 1970-01-01 + 3) mod 5` |
| Caturwara, astawara | indeks efektif — berhenti tiga hari di indeks 70, 71, 72 |
| Sangawara | tiga hari pertama siklus tetap Dangu, lalu `(indeks − 3) mod 9` |
| Ekawara, dwiwara, dasawara | dari jumlah urip saptawara + pancawara |
| Ingkel jejepan | dari sadwara |
| Ingkel wuku | `INGKEL_WUKU[indeks wuku mod 6]` |

**Tabel** (`data/tabel.js`) — dipanen dari keluaran kalenderbali.org karena tidak
punya bentuk rumus sederhana: lintang, pararasan, pancasuda, watek (masing-masing
35 sel, dari kombinasi saptawara × pancawara), ekajalaresi (210 sel, per indeks
pawukon), pratiti samut pada (30 × 12, dari tithi × sasih), dan bhatara per wuku.

**Tabel** (`data/sasih.js`) — penanggal, pangelong, purnama, tilem, nama sasih,
dan tahun Saka. Ini bagian tersulit kalender Bali (ada nampih sasih, mala sasih,
dan ngunaratri), jadi memakai anchor purnama-tilem 1970–2100 dari kalenderbali.org
supaya hasilnya sama persis dengan kalender yang dipakai orang Bali. Konsekuensinya
rentang terbatas: `RENTANG_DIDUKUNG` mengeksport batas itu, dan `hariBali()`
mengembalikan `sasih: null` di luar rentang (pawukon tetap terhitung).

Dua hal yang layak diketahui saat membaca datanya:

- **Ngunaratri.** Kadang satu angka penanggal/pangelong dilewati agar setengah
  bulan muat dalam 14 hari. Posisinya tidak mengikuti rumus 63-hari secara
  konsisten, jadi disimpan per setengah-bulan di array `skip`.
- **Batas sasih berpindah.** Pada 1993-01 sampai 2002-12 kalenderbali.org memakai
  konvensi berbeda: sasih berganti *pada* hari Tilem, bukan sehari sesudahnya.
  Karena itu nama sasih dicari lewat array `unitAwal`/`unitSasih` yang terpisah
  dari perhitungan angka penanggal.

## Rerainan & hari penting

`rerainan.js` mengembalikan `{ nama, jenis, sumber }` untuk tiap hari suci, dan
`hariPenting()` untuk hari peringatan nasional (terpisah supaya bisa dimatikan
sendiri di UI). Tiga sumbernya:

| Sumber | Isi | Bentuk |
|---|---|---|
| Pawukon | Tumpek, Anggar Kasih, Buda Keliwon/Wage, rangkaian Galungan–Kuningan, Hari Bhatara Sri, Saraswati, Pagerwesi | tabel 210 sel di `data/rerainan.js` |
| Sasih | Purnama, Tilem, Nyepi, Ngembak Geni, Siwa Ratri | rumus |
| Keduanya | Kajeng Keliwon dan variannya | rumus |

Tabel pawukon dibangun dari daftar rerainan bulanan kalenderbali.org (18 tahun
sampel, lintas tiga era penanggalan). Sebuah nama hanya masuk kalau ia muncul
pada **semua** kemunculan indeks pawukon itu di seluruh sampel; kalau tidak,
berarti sumbernya bukan pawukon murni dan build gagal alih-alih menebak.

Tiga aturan yang dibaca dari data, bukan dikarang:

- **Varian Kajeng Keliwon.** Enyitan hanya pada penanggal 8–14, Uwudan pada
  seluruh pangelong 1–14, Pamelastali/Watugunung Runtuh pada indeks pawukon 203.
  Pada penanggal 1–7 serta tepat di Purnama dan Tilem, situs sumber tidak memberi
  varian sama sekali — jadi di sini pun tidak. (Situs sumber menulis "Kaleng
  Keliwon" pada penanggal 8; itu salah ketik di sana dan dinormalkan.)
- **Nyepi** = hari pertama sasih Kedasa, yaitu hari sesudah Tilem yang sudah
  berlabel Kedasa. Biasanya penanggal 1, tapi kalau ngunaratri melewati angka 1
  (mis. 2020) hari itu langsung bernomor 2.
- **Ngembak Geni** = sehari sesudah Nyepi, tapi hanya kalau angka penanggalnya
  berurutan. Saat ngunaratri melewati angka itu (mis. 1980), hari itu hilang.

**Di luar cakupan:** piodalan — terikat pura tertentu, jadi tidak deterministik
dari kalender saja.

## Ala-ayuning dewasa

`data/dewasa.js` berisi 220 aturan hasil parsing halaman referensi
kalenderbali.org. Tiap aturan punya pola pemicu (OR dari beberapa kalimat, tiap
kalimat AND dari beberapa syarat), penjelasan aslinya, bobot `alahing` per
kalimat pola, serta tag `baikUntuk`/`burukUntuk` yang diturunkan dari kata kunci
di penjelasan.

**Bobot per pola.** Situs sumber memberi alahing berbeda tergantung kalimat pola
mana yang cocok, jadi `alahingPola` menyimpan satu angka per kalimat.
Tanggal pembandingnya dicari dengan `node scripts/bali-calendar/probe-dewasa.mjs`,
yang mencari satu tanggal yang cocok dengan satu kalimat saja — 96 request, bukan
tahun penuh. Kalau beberapa kalimat cocok bersamaan, yang dipakai yang terberat
(situs menampilkan aturannya dua kali dengan angka masing-masing).

Satu aturan tidak punya bobot sama sekali: **Kala Muncrat**, polanya tertulis
"Soma Pon Merakih" padahal Soma di wuku Merakih selalu Paing — kombinasi itu
tidak pernah terjadi. Tidak ditebak-tebak koreksinya; aturannya memang tidak
pernah aktif, di mesin ini maupun di situs sumbernya.

**Tag kategori** dicocokkan di awal kata, bukan sebagai potongan bebas — aturan
substring bebas sempat membuat "ikan" ikut kena pada "pelantikan". Ada 13
kategori; "Peralatan & senjata" mengikuti pengelompokan situs sumber sendiri dan
mencakup seperempat korpus. Koreksi hasil pembacaan manual ke-220 penjelasan
disimpan di `KOREKSI_TAG` pada `build.py` supaya tidak hilang saat regenerate.

**Wewukon** (Lanus, Basah Cenik, Basah Gede, Ehep, Was Penganten, Tanpa Guru,
dan sebagian nama dari korpus 220) ada di `hari.wuku.wewukon`. Panel harian
kalenderbali.org menampilkannya seolah milik hari itu, tapi tampilan klasik
kalenderbali.com menaruhnya di kepala kolom wuku — dan memang begitu sifatnya:
sepanjang 730 hari (1997 dan 2026, dua era penanggalan) daftarnya tidak pernah
berubah di dalam satu wuku, dengan 21-28 sampel per wuku. Jadi bentuknya tabel
30 sel di `data/tabel.js`, bukan aturan harian, dan build gagal kalau sampelnya
ternyata tidak konstan.

Dua koreksi empiris tercatat di `scripts/bali-calendar/build.py`:

- `"Sri Sri"` (Sri Tumpuk) berarti caturwara Sri + astawara Sri; `"Sri"` tunggal
  berarti astawara.
- Untuk Kala Buingrau, `"Soma Uma"` di halaman referensi ternyata pemotongan dari
  `"Soma Umanis"`, dan aturannya juga mencakup `"Sukra Ludra"`.

Keduanya ditemukan dengan membandingkan keluaran mesin ini terhadap keluaran
harian kalenderbali.org, bukan ditebak.

## Karya Ayu (otonan)

`karyaAyu(tanggalLahir, hari)` menilai kecocokan satu hari dengan kelahiran
seseorang. Urip saptawara + pancawara hari lahir dijumlahkan dengan urip hari
yang ditimbang, lalu dibagi empat; sisanya menentukan kategori:

| Sisa | Kategori | Nilai |
|---|---|---|
| 1 | Guru | baik |
| 2 | Ratu | baik |
| 3 | Rogoh | tidak baik |
| 0 | Sempoyong | tidak baik |

Aturan ini diturunkan dari `karyaayu.php` kalenderbali.org — halaman yang
menerima tanggal lahir lalu menilai tiap hari pada bulan yang dipilih.
(`carijodoh.php` dan `jodoh.php` sempat diperiksa lebih dulu sesuai rencana,
tapi keduanya ramalan kecocokan *pasangan*, bukan pemilihan hari.)

`cariHariBaik()` menerima `{ otonan: [tglLahir1, tglLahir2], otonanWajib }`.
Keduanya opsional: tanpa `otonan`, keluarannya persis sama seperti sebelum
parameter ini ada. Hasil Karya Ayu dilaporkan di `nilai.karyaAyu` dan **tidak**
dijumlahkan ke skor dewasa — dua aturan berbeda, jadi dilaporkan terpisah.

## Pembandingan dengan sumber kedua

Tiga situs dipakai sebagai rujukan di awal, tapi ada temuan yang mengubah
artinya: **kalenderbali.com dan kalenderbali.org disusun orang yang sama**
(I Wayan Nuarsa, Universitas Udayana — tertulis di footer keduanya). Jadi
kesepakatan antara keduanya bukan bukti kebenaran; yang diuji adalah apakah dua
penyajian dari penerbit yang sama konsisten, bukan apakah dua tradisi sepakat.
Pembandingan dengan sumber yang benar-benar independen masih terbuka.

Bulan yang dibandingkan tidak diambil acak rata: `pilih-bulan-crosscheck.mjs`
sengaja menumpuknya di nampih sasih, mala sasih, dan setengah-bulan yang kena
ngunaratri — di situlah kalender paling mungkin berbeda.

| Bidang | Hasil |
|---|---|
| Sepuluh wewaran, urip, ingkel jejepan | 1.001/1.001 hari cocok |
| Pararasan, lintang, pancasuda, ekajalaresi | 1.001/1.001 hari cocok |
| Pratiti samut pada | 1.001/1.001 hari cocok |
| Nama sasih (termasuk seluruh Mala & Nampih) | 1.001/1.001 hari cocok |
| Angka penanggal/pangelong | 996/1.001 hari cocok |

Total **19.014 dari 19.019 field** (99,97%) pada 1.009 hari di 33 bulan terpilih;
8 hari di Januari 1970 dilewati karena di luar rentang sasih yang didukung.

Kelima selisihnya bukan perbedaan kalender melainkan perbedaan penulisan:

- Empat hari Purnama/Tilem yang jatuh pada setengah-bulan ngunaratri. .com
  menomorinya 14, .org menyebutnya Purnama/Tilem (15). Panel detail hari menandai
  kondisi ini supaya pembaca tahu ada dua cara penomoran.
- Satu tanggal (27 Januari 1971) .com menulis "151" — galat tampilan di sana.

Di luar itu .com menulis hari ngunaratri sebagai pasangan angka ("6/7") sementara
.org hanya menulis angka yang dipakai; itu dianggap cocok saat membandingkan.

## Validasi

`node scripts/bali-calendar/validate.mjs` membandingkan mesin ini dengan data
yang dipanen dari kalenderbali.org:

- **5.607 hari** (1970–2100) untuk saptawara, pancawara, dan wuku — cocok semua.
- **730 hari** (1997 dan 2026) untuk 19 field harian: sepuluh wewaran, urip,
  penanggal, sasih, lintang, pararasan, pancasuda, watek, ekajalaresi, pratiti,
  dan ingkel jejepan — cocok semua.
- **730 hari** untuk Wewukon per wuku — cocok semua.
- **6.574 hari** (18 tahun sampel) untuk rerainan — 6.567 cocok persis, dan
  **6.574/6.574** untuk hari penting nasional. Tujuh hari yang tersisa bukan soal
  aturan rerainannya, melainkan dua batasan mesin yang memang sudah tercatat:
  dua hari di Januari 1970 berada di luar rentang sasih yang didukung, dan lima
  hari di sekitar 1993-01 serta 1995-03 jatuh tepat pada pergantian era
  penanggalan, di mana label sasih mesin ini meleset satu sasih dari situs
  sumber. Validator mencetak ketujuhnya per tanggal supaya regresi baru langsung
  kelihatan.
- **4.380 hari** (6 tanggal lahir × 2 tahun) untuk Karya Ayu — cocok semua.
- **8.165 bobot alahing** di 826 hari — cocok semua.
- **826 hari** untuk daftar ala-ayuning dewasa — cocok semua. Dua tahun penuh
  (2026 dan 1997, dua era batas sasih yang berbeda) plus 96 tanggal probe yang
  tersebar 1970-2017. kalenderbali.org kadang menampilkan dewasa yang sama dua
  kali ketika polanya memang tertulis dobel; mesin ini menggabungkannya, jadi
  perbandingannya dilakukan sebagai himpunan.

## Dauh ayu & teks tafsir

- **Dauh ayu** (`hari.dauhAyu`) — rentang jam yang dipandang baik untuk memulai
  kegiatan. Hanya bergantung saptawara: 120 hari sampel di empat bulan lintas
  musim dan tiga era penanggalan memberi rentang jam yang identik, jadi bentuknya
  tabel tujuh sel.
- **Teks tafsir** (`data/arti.js`) — penjelasan naratif per nilai untuk sepuluh
  wewaran, wuku, lintang, pararasan, pancasuda, ekajalaresi, pratiti, dan
  penanggal; 210 teks di 17 komponen, dipanen dari `artihari.php`. Tidak ikut
  bundel awal — komponen kalender memuatnya lewat dynamic import.

## Menjalankan ulang

```
npm test                       # validator
npm run kalender:build         # bangun ulang data/ dari fixtures/
python scripts/bali-calendar/scrape.py <tahap>
node scripts/bali-calendar/probe-dewasa.mjs
node scripts/bali-calendar/pilih-bulan-crosscheck.mjs
```

Semua tahap scrape resumable dan menyimpan cache HTML di `scripts/bali-calendar/raw/`
(tidak di-commit). Urutan yang masuk akal untuk membangun dari nol: `anchors`,
`skips`, `rules`, `ground`, `alaayu`, `rerainan`, `karyaayu`, `arti`, `dauhayu`,
lalu `crosscheck`.

## Atribusi

Aturan wariga adalah pengetahuan adat milik bersama, tapi korpus terstrukturnya —
220 ala-ayuning dewasa beserta pola dan bobotnya, anchor purnama-tilem 1970–2100,
tabel wewukon, dauh ayu, dan teks tafsir — disusun dan diterbitkan oleh Kalender
Bali Digital, kalenderbali.org (I Wayan Nuarsa, Universitas Udayana). Kreditnya
dicantumkan di halaman kalender.

## Catatan pemakaian

Skor pada `cariHariBaik()` hanya menjumlahkan alahing dewasa dari aturan
tertulis, ditambah kriteria pawiwahan umum. Otonan mempelai, kebiasaan desa, dan
pertimbangan keluarga tidak masuk hitungan — dan itu yang biasanya menentukan.
Perlakukan hasilnya sebagai daftar awal untuk dibawa ke pemangku, bukan jawaban.
