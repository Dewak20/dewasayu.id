# Dewasa Ayu — Wedding Planner

Dashboard pencatatan anggaran pernikahan berbasis Next.js App Router dan React.

## Menjalankan aplikasi

Buka terminal dari folder proyek, lalu jalankan:

```powershell
npm install
npm run dev
```

Kemudian buka `http://localhost:3000`.

## Deploy ke Vercel

Impor repository ini melalui dashboard Vercel. Framework akan terdeteksi otomatis sebagai Next.js, sehingga build command dan output directory tidak perlu diatur manual.

## Fitur versi awal

- Dashboard dua tanggal acara dan countdown
- Sumber dana, 17 kategori alokasi, realisasi, dan deteksi data anomali
- Transaksi DP, cicilan, pembayaran, dan pelunasan
- 38 checklist persiapan dengan status, vendor, serta tenggat
- Perbandingan 21 vendor MUA dan seluruh paketnya
- Shortlist 66 lokasi prewedding
- Daftar tamu untuk empat kelompok pemilik undangan dan RSVP
- Souvenir, box seserahan, dan status pembelian
- Checklist dokumen administrasi beserta tautan referensi
- Mood board dengan catatan dan 14 aset gambar dari workbook
- Penyimpanan otomatis dengan `localStorage`
- Tampilan responsif untuk desktop dan ponsel

Data contoh akan tampil pada kunjungan pertama. Setelah diubah, data tersimpan hanya di browser/perangkat yang sedang digunakan. Gunakan database seperti Vercel Postgres atau Supabase jika data perlu dibagikan antarperangkat atau pengguna.

## Memperbarui data dari Excel

Workbook sumber disimpan di folder `docs`. Jalankan perintah berikut setelah mengganti file Excel:

```powershell
python scripts/extract_workbook.py
```

Script akan memperbarui `data/wedding-data.json` dan aset pada `public/excel-assets`. Data mentah semua sel non-kosong juga dipertahankan di dalam JSON untuk audit.
