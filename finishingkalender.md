# Rencana Penyelesaian Kalender Bali

Status awal: mesin kalender di `lib/bali-calendar/` sudah jalan dan tervalidasi
(pawukon 5.607 hari, 19 field harian × 730 hari, 365 hari daftar dewasa, 30
tanggal acak — semua cocok dengan kalenderbali.org). Yang tersisa adalah
melengkapi cakupan, menutup lubang data, dan merapikan sisi pengguna.

Dokumen ini memecah sisa pekerjaan jadi tujuh tahap. Tiap tahap berdiri sendiri
dan bisa di-commit terpisah — urutannya boleh digeser, catatan ketergantungan
ada di masing-masing tahap.

---

## Prinsip yang dipakai sepanjang pengerjaan

1. **Jangan mengarang aturan adat.** Setiap aturan baru harus punya sumber
   tertulis yang bisa ditunjuk. Kalau sumbernya tidak ada, tahan — jangan tebak.
2. **Setiap aturan wajib lewat validator.** Tambahkan kasus uji ke
   `scripts/bali-calendar/validate.mjs` di tahap yang sama, bukan nanti.
   Tahap dianggap belum selesai kalau validatornya belum hijau.
3. **Data hasil generate tidak diedit tangan.** Ubah `scripts/bali-calendar/build.py`,
   jalankan ulang, commit hasilnya.
4. **Turunkan dengan rumus kalau bisa, tabel kalau terpaksa.** Tabel hanya untuk
   yang memang tidak punya bentuk rumus (sasih, lintang, pratiti).
5. **Disclaimer desa-kala-patra tetap ada** di setiap tampilan yang menyarankan
   tanggal.

---

## Tahap 1 — Rerainan & hari penting — SELESAI

**Hasil:** `rerainan()` dan `hariPenting()` ada di mesin, tervalidasi terhadap
6.574 hari (18 tahun sampel). Rerainan 6.567/6.574 cocok persis; hari penting
nasional 6.574/6.574. Tujuh hari yang tersisa bukan soal aturan rerainannya,
melainkan dua batasan mesin yang sudah tercatat sejak sebelumnya: dua hari di
Januari 1970 di luar rentang sasih, dan lima hari di pergantian era penanggalan
(1993-01, 1995-03) di mana label sasih meleset satu sasih dari situs sumber.
Varian Kajeng Keliwon, Nyepi, Ngembak Geni, dan Siwa Ratri semuanya dibaca dari
data, bukan dikarang — aturannya ditulis di `lib/bali-calendar/README.md`.
Piodalan dan label Wewukon dinyatakan di luar cakupan.


**Kenapa duluan:** ini yang pertama dicari orang saat membuka kalender Bali.
Tanpa Galungan, Kuningan, Tumpek, dan Kajeng Kliwon, kalendernya terasa tidak
lengkap — dampaknya ke pengguna paling besar dibanding tahap lain.

**Modal yang sudah ada:** 216 file bulanan di `scripts/bali-calendar/raw/month/`
(18 tahun sampel, lintas tiga era penanggalan) sudah memuat daftar rerainan
*dan* daftar hari penting nasional per bulan. Tidak perlu request baru untuk
membangun dan memvalidasi tahap ini.

**Langkah:**

1. Tambah tahap `rerainan` di `scrape.py` yang mengekstrak baris berpola
   `DD-MM-YYYY. <nama>` dari file bulanan yang sudah tersimpan, lalu pisahkan
   jadi dua fixture: `gt_rerainan.json` (rerainan Hindu) dan
   `gt_haripenting.json` (peringatan nasional).
2. Inventarisasi jenis rerainan yang muncul, kelompokkan jadi tiga:
   - **Dari pawukon murni** — Tumpek (Saniscara Keliwon pada 6 wuku tertentu),
     Anggara Kasih, Buda Keliwon, Buda Cemeng/Wage, Kajeng Keliwon, Galungan &
     Kuningan (wuku Dunggulan & Kuningan), hari Bhatara. Ini jadi rumus.
   - **Dari sasih** — Purnama, Tilem, Nyepi (penanggal 1 Kedasa), Ngembak Geni,
     Siwa Ratri (Tilem Kepitu). Ambil dari tabel sasih yang sudah ada.
   - **Sisanya** — kalau ada yang tidak masuk dua kelompok di atas, catat
     terpisah; jangan dipaksakan jadi rumus.
3. Implementasi `rerainan(hari)` di `lib/bali-calendar/`, kembalikan array
   `{ nama, jenis, sumber }`.
4. Kajeng Kliwon punya varian **Enyitan / Uwudan / Pamelastali** yang bergantung
   posisi terhadap purnama-tilem — pastikan variannya ikut benar, jangan cuma
   "Kajeng Keliwon" generik.
5. Hari penting nasional: sebagian besar tanggal Masehi tetap, jadi cukup tabel
   statis kecil. Pisahkan dari rerainan Hindu supaya bisa dimatikan sendiri.
6. UI: tanda di sel kalender, daftar rerainan sebulan di bawah grid, dan bagian
   rerainan di panel detail hari.

**Selesai kalau:** validator membandingkan `rerainan()` terhadap
`gt_rerainan.json` untuk seluruh 18 tahun sampel dan cocok semua — termasuk
varian Kajeng Kliwon.

**Risiko:** kalau ada rerainan yang ternyata tidak deterministik (misalnya
piodalan yang bergantung pura tertentu), jangan dipaksa masuk. Keluarkan dari
cakupan tahap ini dan catat di README.

---

## Tahap 2 — Otonan mempelai masuk ke pencarian hari baik — SELESAI

**Hasil:** sumbernya ketemu, tapi bukan di tempat yang ditebak rencana ini.
`carijodoh.php` dan `jodoh.php` ternyata memang hanya ramalan kecocokan
*pasangan*, persis seperti yang dikhawatirkan. Yang terpakai adalah
**`karyaayu.php`** — halaman yang menerima satu tanggal lahir lalu menilai tiap
hari sebagai Guru/Ratu/Sempoyong/Rogoh. Aturannya turun jadi satu baris:
`(urip lahir + urip hari) mod 4`, tervalidasi 4.380/4.380 hari terhadap 6
tanggal lahir × 2 tahun. `cariHariBaik()` menerima `{ otonan, otonanWajib }`
yang keduanya opsional, dan hasilnya tampil sebagai baris tersendiri di kartu
hasil — tidak dijumlahkan ke skor dewasa.


**Kenapa penting:** menurut catatan proyek, inilah pembeda dari DenganRestu.
Sekarang kalkulator otonan berdiri sendiri dan `cariHariBaik()` sama sekali
tidak menerimanya — jadi pembedanya belum benar-benar ada.

**Ketergantungan:** butuh sumber aturan yang belum dipakai. Kandidat di
kalenderbali.org: `carijodoh.php` dan `jodoh.php`. **Periksa dulu apakah
keduanya memuat aturan yang bisa diparse.** Kalau ternyata hanya ramalan
kecocokan pasangan dan bukan aturan pemilihan hari, tahap ini berhenti di situ
dan menunggu buku wariga — jangan dikarang.

**Langkah:**

1. Survei `carijodoh.php` dan `jodoh.php`; putuskan apakah bisa jadi sumber.
2. Kalau bisa: panen jadi fixture, parse jadi aturan, validasi seperti korpus
   dewasa — bandingkan keluaran mesin dengan keluaran situs untuk sekumpulan
   pasangan tanggal lahir.
3. Tambah parameter opsional ke `cariHariBaik()`, misalnya
   `{ otonan: [tglLahir1, tglLahir2] }`. Sifatnya **opsional** — tanpa otonan,
   fungsi harus tetap bekerja persis seperti sekarang.
4. UI: dua input tanggal lahir di `/kalender/hari-baik`, dan alasan terkait
   otonan muncul sebagai baris tersendiri di kartu hasil, terpisah dari
   ala-ayuning dewasa supaya jelas mana yang dari aturan mana.

**Selesai kalau:** sumbernya ketemu, aturannya tervalidasi, dan pencarian tanpa
otonan tetap memberi hasil identik dengan sebelum perubahan.

**Kalau sumbernya tidak ada:** hentikan, tulis temuannya di README, dan tandai
tahap ini menunggu buku. Itu hasil yang sah — bukan kegagalan.

---

## Tahap 3 — Tutup lubang di korpus aturan dewasa — SELESAI

**Hasil per butir:**

1. **13 dewasa tanpa bobot** — tidak perlu memanen tahun tambahan.
   `probe-dewasa.mjs` mencari satu tanggal per kalimat pola, jadi cukup 96
   request. Sekarang 219/220 aturan berbobot.
2. **5 dewasa dengan bobot bervariasi** — sudah per-pola (`alahingPola`).
   Kalau beberapa pola cocok bersamaan, dipakai yang terberat; itu diuji pada
   Agni Agung Doyan Basmi 22 April 1997, hari yang di situs sumber tampil dobel
   dengan dua angka sekaligus.
3. **Audit tag** — selesai, dan menemukan empat kelas galat: pencocokan
   substring bebas ("ikan" kena pada "pelantikan"), pemisahan klausa yang hanya
   mengenali "Tidak baik" berhuruf besar, kata kunci yang tidak menangkap bentuk
   berawalan ("menanam" tidak memuat "tanam"), dan satu kategori yang memang
   belum ada. Kategori **Peralatan & senjata** ditambahkan mengikuti
   pengelompokan situs sumber sendiri. Aturan tanpa tag turun dari 52 ke 20, dan
   sisanya memang umum ("segala pekerjaan") atau di luar 13 kategori.
4. **Validasi era kedua** — 1997 dipanen penuh; daftar dewasa 826/826 hari dan
   8.165/8.165 bobot cocok.
5. **Label Wewukon** — **diimplementasi**, dan jawabannya datang dari Tahap 4.
   Sempat hampir dinyatakan di luar cakupan: keenamnya tampak deterministik per
   indeks pawukon, tapi kontrolnya gagal (Kala Ingsor yang jelas bergantung
   sasih ikut lolos). Yang membuka jalan adalah tampilan klasik
   kalenderbali.com, yang menaruh label-label itu di **kepala kolom wuku**, bukan
   di hari. Diuji ulang dengan hipotesis itu: 730 hari, 21-28 sampel per wuku,
   dua era penanggalan, tidak satu pun bentrok. Sekarang tabel 30 sel di
   `data/tabel.js`, tampil di `hari.wuku.wewukon`, tervalidasi 730/730.

**Catatan:** satu aturan tetap tanpa bobot — **Kala Muncrat**, polanya tertulis
"Soma Pon Merakih" padahal Soma di wuku Merakih selalu Paing. Kombinasi itu
mustahil, jadi aturannya tidak pernah aktif di mesin ini maupun di situs
sumbernya. Tidak ditebak koreksinya.


**Kenapa di sini:** sebagian besar pekerjaannya scraping yang bisa jalan di
latar belakang sambil tahap lain dikerjakan, dan hasilnya memperbaiki kualitas
skor di seluruh fitur.

**Langkah:**

1. **13 dewasa tanpa bobot.** Belum pernah muncul sepanjang 2026, jadi
   `alahing`-nya belum diketahui dan sekarang memakai default 3. Scrape
   `alaayu.php` untuk satu tahun tambahan (2027 atau 1997 — pilih yang
   memunculkan paling banyak dari 13 itu), lalu periksa sisa yang masih kosong.
2. **5 dewasa dengan bobot bervariasi.** Bobotnya berubah tergantung pola mana
   yang cocok; sekarang diambil nilai maksimum. Petakan bobot ke masing-masing
   kalimat pola, ubah struktur data jadi bobot per-pola.
3. **Audit tag `baikUntuk` / `burukUntuk`.** Sekarang hasil pencocokan kata
   kunci — cukup untuk 12 kategori tapi belum pernah diperiksa manual. Baca
   ke-220 penjelasan, betulkan yang salah kategori. Pindahkan hasil koreksi ke
   daftar eksplisit di `build.py` supaya tidak hilang saat regenerate.
4. **Validasi dewasa untuk era kedua.** Sekarang hanya 2026. Scrape
   `alaayu.php` sepanjang 1997 (era batas sasih yang berbeda) dan tambahkan ke
   validator.
5. **Label `Wewukon`.** Panel harian situsnya menampilkan Lanus, Was Penganten,
   dan sejenisnya yang tidak ada di korpus 220 aturan. Sudah ikut terpanen di
   `gt_day.json` tapi belum dipakai. Putuskan: implementasi, atau catat sebagai
   di luar cakupan.

**Selesai kalau:** tidak ada lagi dewasa yang memakai bobot default, bobot
varian sudah per-pola, tag sudah diaudit, dan validator mencakup dua era untuk
daftar dewasa.

---

## Tahap 4 — Cross-check dua sumber lain — SEBAGIAN

**Temuan yang mengubah premis tahap ini:** kalenderbali.com dan kalenderbali.org
**disusun orang yang sama** — I Wayan Nuarsa, Universitas Udayana, tertulis di
footer keduanya. Jadi kesepakatan keduanya bukan bukti kebenaran. Yang terukur
adalah konsistensi dua penyajian dari penerbit yang sama.

**Hasil terukur:** 1.009 hari di 33 bulan yang sengaja ditumpuk di nampih sasih,
mala sasih, dan ngunaratri. **19.014 dari 19.019 field cocok (99,97%)**, dan
seluruh nama sasih — termasuk semua Mala dan Nampih — cocok persis. Kelima
selisihnya soal penulisan, bukan kalender: empat hari Purnama/Tilem pada
setengah-bulan ngunaratri yang .com nomori 14, dan satu galat tampilan ("151").
Tabel lengkapnya di `lib/bali-calendar/README.md`.

**UI:** panel detail hari sekarang menandai hari ngunaratri dan menyebut bahwa
kalender lain bisa menomorinya berbeda — satu-satunya titik di mana dua sumber
itu memang berbeda.

**Yang belum:** situs ketiga. Identitasnya tidak tercatat di repo mana pun, jadi
pembandingan dengan sumber yang benar-benar independen masih menunggu.


**Kenapa:** tiga situs diberikan di awal, tapi praktis hanya kalenderbali.org
yang dipakai karena cuma dia yang menerbitkan aturannya secara terstruktur.
Akibatnya, **kalau ketiganya berbeda di suatu tanggal, kita belum tahu.**

Satu-satunya data pembanding yang ada sekarang: untuk 12 September 2026,
kalenderbali.com identik dengan .org di semua field yang sempat dilihat. Itu
belum cukup untuk menyimpulkan apa pun.

**Langkah:**

1. Ambil sampel acak yang tersebar — minimal 60 tanggal lintas 1970–2100,
   sengaja menyertakan tanggal di sekitar nampih sasih, mala sasih, dan hari
   ngunaratri, karena di situlah kalender-kalender paling mungkin berbeda.
2. Bandingkan wewaran, wuku, penanggal, dan sasih dari ketiga situs.
3. Tulis hasilnya sebagai tabel di README: di mana ketiganya sepakat, dan di
   mana tidak.
4. **Kalau ada perbedaan:** jangan diam-diam pilih salah satu. Tampilkan
   catatan di UI untuk tanggal yang sumbernya berbeda, supaya pengguna tahu ada
   dua pendapat. Ini justru menambah kredibilitas, bukan mengurangi.

**Selesai kalau:** tingkat kesepakatan antar sumber terdokumentasi dengan angka,
bukan dugaan.

---

## Tahap 5 — Perbaikan sisi pengguna — SELESAI

1. **Mobile** — diuji di 360px dan 414px lewat iframe (media query mengikuti
   viewport iframe, jadi tidak perlu mengandalkan resize jendela). Tidak ada
   overflow horizontal di kedua lebar. Di bawah 560px sel menyusut jadi tanggal
   + penanda saja, daftar rerainan bulanan jadi satu kolom, dan panel detail
   turun ke bawah grid. Tinggi sel dijaga 44px sebagai target sentuh.
2. **Aksesibilitas** — strukturnya sekarang grid sungguhan: `role="grid"` dengan
   `role="row"` per minggu dan `role="gridcell"` per sel, `aria-selected` pada
   sel terpilih, `aria-current="date"` pada hari ini, dan `aria-label` yang
   menyebut hari + tanggal Masehi + wewaran + wuku + sasih + rerainan. Roving
   tabindex: satu sel bisa di-tab, sisanya dijangkau panah. Panah kiri/kanan
   (±1 hari), atas/bawah (±7), PageUp/PageDown (±28), Home/End (awal/akhir
   bulan) — semuanya ikut berganti bulan dan fokusnya menyusul. Diuji langsung
   di browser.
3. **State di URL** — `?tanggal=` dan `?bulan=` disinkronkan lewat
   `history.replaceState`, dan dibaca kembali saat halaman dibuka.
4. **Batas rentang** — tombol bulan dinonaktifkan di ujung rentang dan ada
   keterangan batas 1970-2100 di bawah grid.
5. **Navigasi antar halaman** — tiap kartu hasil pencarian hari baik punya
   tautan "Lihat di kalender" ke tanggalnya. Halaman `/dewasa-ayu`,
   `/dewasa-ayu/otonan`, dan `/dewasa-ayu/pernikahan` menautkan balik ke alat
   yang relevan. Sekalian membetulkan teks usang di halaman otonan yang masih
   menulis "sambil menunggu kalkulatornya" — kalkulatornya sudah ada.


**Kenapa setelah data:** percuma merapikan tampilan kalau isinya masih berubah.

**Langkah:**

1. **Mobile.** Belum pernah dicek di lebar HP sama sekali. Grid 7 kolom dengan
   tiga baris teks per sel hampir pasti berantakan di layar kecil. Uji di ~360px
   dan ~414px. Kemungkinan perlu: sel lebih ringkas (tanggal + penanda saja),
   panel detail jadi lembar geser, bukan kolom samping.
2. **Aksesibilitas kalender.** Sekarang `role="grid"` dipakai tapi strukturnya
   bukan grid yang benar (tidak ada `role="row"`), dan tombol tanggalnya tidak
   punya label yang terbaca screen reader — hanya angka. Perbaiki struktur
   ARIA-nya, beri `aria-label` yang menyebut tanggal Masehi + wewaran, tandai
   tanggal terpilih dengan `aria-selected`, dan pastikan bisa dijelajahi dengan
   tombol panah.
3. **State di URL.** Ganti bulan dan pilih tanggal tidak mengubah URL, jadi
   hasilnya tidak bisa dibagikan. Sinkronkan ke query param.
4. **Batas rentang.** `CatatanDewasa` sudah punya pesan jelas saat tanggal di
   luar 1970–2100, tapi halaman kalender belum. Samakan.
5. **Navigasi antar halaman.** Tautkan kalender ↔ halaman konten `/dewasa-ayu`
   secara dua arah, dan dari hasil pencarian hari baik ke detail tanggal.

**Selesai kalau:** lolos uji di lebar HP, kalender bisa dipakai dengan keyboard
saja, dan tautan tanggal bisa dibagikan.

---

## Tahap 6 — Konten & SEO — SELESAI (kecuali piodalan)

1. **Teks tafsir tiap wara** — sumbernya bukan kalenderbali.com melainkan
   `artihari.php` di kalenderbali.org, yang memberi tafsir naratif untuk sepuluh
   wewaran, wuku, lintang, pararasan, pancasuda, ekajalaresi, pratiti, dan
   penanggal. Dipanen dengan penutupan nilai, bukan per hari: 210 tafsir di 17
   komponen, dan panen berhenti sendiri begitu semua nilai terlihat. Tampil di
   panel detail sebagai lapisan penjelas, dimuat terpisah dari bundel awal.
2. **Halaman tabel tanggal per tahun** — `/dewasa-ayu/pernikahan/[tahun]` terbit
   sebagai SSG untuk tahun berjalan plus dua tahun ke depan, dikelompokkan per
   bulan, tiap tanggal menaut ke detailnya di kalender. Paragraf induknya yang
   menyatakan sedang "menunggu mesin perhitungan tervalidasi" sudah diganti.
   Daftar tahunnya dipegang satu modul (`lib/tahun-terbit.js`) supaya halaman
   induk dan `generateStaticParams` tidak pernah berbeda.
3. **Dauh ayu** — ternyata hanya bergantung saptawara: 120 hari sampel di empat
   bulan lintas musim dan tiga era memberi rentang jam yang identik. Jadi tabel
   tujuh sel, bukan data harian. Tampil di panel detail, tervalidasi 122/122.
4. **Piodalan** — tetap **di luar cakupan**: terikat pura tertentu, jadi tidak
   deterministik dari kalender saja. Tercatat di README.
5. **Metadata & data terstruktur** — `/kalender` punya `generateMetadata` yang
   menyebut tanggal, wewaran, wuku, sasih, dan rerainannya, plus JSON-LD
   `WebApplication` (+`Event` untuk tanggal yang dibuka). Halaman tahun punya
   `generateMetadata` dan JSON-LD `Article` sendiri.


**Kenapa di sini:** ini yang mengubah mesin jadi trafik. Butuh mesin yang sudah
stabil dulu — halaman tanggal spesifik yang salah lebih merugikan daripada
tidak ada halaman sama sekali.

**Langkah:**

1. **Teks tafsir tiap wara.** kalenderbali.com punya penjelasan naratif untuk
   tiap wara, lintang, pararasan, pancasuda, dan pratiti ("Menga. Terbuka.",
   "Paing. Rajin, tetapi sering melamun…"). Panen jadi fixture, tampilkan di
   panel detail sebagai lapisan penjelas. Ini sekaligus memperkaya halaman
   untuk mesin pencari.
2. **Halaman tabel tanggal per tahun** — `/dewasa-ayu/pernikahan/[tahun]`.
   Halaman `/dewasa-ayu/pernikahan` sendiri menulis bahwa tanggal spesifik
   ditahan "sampai mesin perhitungan tervalidasi"; syarat itu sudah terpenuhi.
   Buat sebagai halaman statis (SSG) per tahun, dengan disclaimer jelas.
   **Perbarui juga paragraf di halaman induknya** supaya tidak lagi berkata
   sedang menunggu.
3. **Dauh ayu** — pembagian waktu baik dalam sehari, ada di `dauhayu.php`.
   Nilai tambah yang jelas untuk halaman detail tanggal.
4. **Piodalan** (`piodalan.php`) — pertimbangkan; cakupannya luas dan terikat
   pura tertentu, jadi mungkin lebih cocok jadi tahap tersendiri nanti.
5. Metadata: `generateMetadata` per tanggal/tahun, dan data terstruktur
   (JSON-LD) untuk halaman kalender.

**Selesai kalau:** halaman tahun terbit, halaman induk sudah diperbarui, dan
panel detail memuat tafsir.

---

## Tahap 7 — Pengerasan & kerapian — SEBAGIAN

1. **Validator masuk npm** — `npm test` menjalankan validator. Ditambah juga
   `npm run kalender:build` untuk membangun ulang data dari fixtures.
2. **Ukuran bundle** — dikerjakan karena memang terasa. Korpus 220 aturan
   (~200 kB) sekarang dimuat terpisah lewat `next/dynamic` di planner, dan teks
   tafsir (~30 kB) lewat dynamic import di kalender. Planner turun dari 173 kB
   kembali ke **137 kB** first-load, praktis sama seperti sebelum kalender masuk.
3. **Atribusi sumber** — **dicantumkan**, sesuai rekomendasi. Halaman kalender
   menyebut Kalender Bali Digital (I Wayan Nuarsa, Universitas Udayana) sebagai
   penyusun korpus terstrukturnya, sambil menegaskan aturan wariga itu sendiri
   pengetahuan adat milik bersama.
4. **Kerentanan npm** — *belum dikerjakan, sesuai catatan tahap ini untuk
   menanganinya terpisah.* Tapi satu koreksi: perbaikannya **bukan** lompatan
   versi. `npm audit fix --force` akan memasang **next@15.5.25** dari 15.5.2 —
   naik patch di dalam 15.5, bukan pindah mayor. Ada 3 kerentanan (1 kritis, 2
   tinggi) di next, postcss, dan sharp. Keputusan menjalankannya ada di tangan
   pemilik proyek.
5. **Merge branch** — *belum dikerjakan.* Seluruh pekerjaan ini masih di
   `feature/keuangan-wave1` dan belum di-commit. Pemindahan branch dan commit
   menunggu keputusan pemilik proyek.


**Langkah:**

1. **Validator masuk ke skrip npm.** Tambahkan `"test": "node scripts/bali-calendar/validate.mjs"`
   di `package.json` supaya tidak perlu diingat manual. Kalau nanti ada CI,
   sambungkan ke sana.
2. **Ukuran bundle.** Planner naik dari 136 ke 170 kB karena korpus 220 aturan
   ikut ke client. Pilihan: lazy-load `data/dewasa.js`, atau pindahkan evaluasi
   dewasa ke server untuk halaman yang tidak butuh interaktif. Kerjakan kalau
   memang terasa, jangan optimasi buta.
3. **Atribusi sumber.** Perlu keputusan: apakah mencantumkan kredit ke
   kalenderbali.org di halaman kalender. Aturan wariga itu pengetahuan adat,
   bukan ciptaan mereka — tapi korpus terstrukturnya hasil kerja mereka.
   Rekomendasi: cantumkan, karena justru menguatkan klaim akurasi.
4. **Kerentanan Next.js 15.5.2** yang tercatat sebelum sesi ini masih ada.
   Tangani terpisah dari pekerjaan kalender — `npm audit fix --force` bisa
   melompat versi Next.
5. **Merge branch.** Semua pekerjaan ini ada di `feature/keuangan-wave1`, yang
   namanya sudah tidak cocok lagi dengan isinya. Pertimbangkan pindah ke branch
   sendiri sebelum merge ke `main`.

---

## Ringkasan urutan

| Tahap | Isi | Bergantung pada | Bisa diparalelkan? |
|---|---|---|---|
| 1 | Rerainan & hari penting | — | — |
| 2 | Otonan masuk skoring | sumber aturan harus ketemu dulu | ya |
| 3 | Tutup lubang korpus dewasa | — | ya, scraping jalan di latar |
| 4 | Cross-check 2 sumber lain | — | ya |
| 5 | Mobile, aksesibilitas, URL | idealnya setelah 1 & 3 | — |
| 6 | Konten & SEO | setelah 1, 3, 5 | — |
| 7 | Pengerasan & kerapian | terakhir | sebagian |

**Kalau harus memilih tiga saja:** Tahap 1 (dampak pengguna terbesar), Tahap 2
(itu pembedanya), Tahap 5 poin mobile (karena belum pernah dicek sama sekali,
jadi risikonya tidak diketahui).

**Tahap 2 adalah satu-satunya yang bisa gagal karena alasan di luar kendali** —
kalau sumber aturan kecocokan otonan tidak ada di situs mana pun, tahap itu
menunggu buku wariga. Semua tahap lain modalnya sudah lengkap.
