"""Panen data kalender Bali dari kalenderbali.org ke fixtures/.

    python scripts/bali-calendar/scrape.py anchors     # purnama-tilem 1970-2100
    python scripts/bali-calendar/scrape.py rules       # 220 aturan ala-ayuning dewasa
    python scripts/bali-calendar/scrape.py ground      # data harian utk validasi (2 tahun + grid bulanan)
    python scripts/bali-calendar/scrape.py rerainan    # daftar rerainan & hari penting per bulan
    python scripts/bali-calendar/scrape.py karyaayu    # kategori Karya Ayu per tanggal lahir
    python scripts/bali-calendar/scrape.py alaayu      # ala-ayuning dewasa harian + bobot alahing
    python scripts/bali-calendar/scrape.py crosscheck  # sumber kedua (kalenderbali.com) utk pembandingan
    python scripts/bali-calendar/scrape.py arti        # teks tafsir tiap wara/wuku/lintang/pratiti
    python scripts/bali-calendar/scrape.py dauhayu     # dauh ayu (waktu baik dalam sehari) per saptawara
    python scripts/bali-calendar/scrape.py skips       # posisi ngunaratri (binary search, ~3000 request)

Semua tahap resumable: file yang sudah ada dilewati. Ada jeda antar request
supaya tidak membebani situs sumber. Butuh `requests`.

Fixtures hasil panen ini yang dipakai build.py. Kalau rentang tahun mau diperluas,
ubah TAHUN_AWAL/TAHUN_AKHIR lalu jalankan `anchors` dan `skips` lagi.
"""

import datetime
import html
import json
import os
import re
import sys
import threading
import time
import queue

import requests

DIR = os.path.dirname(os.path.abspath(__file__))
FIX = os.path.join(DIR, "fixtures")
RAW = os.path.join(DIR, "raw")
BASE = "https://kalenderbali.org/"
UA = "Mozilla/5.0 (research; membangun mesin kalender Bali terbuka)"
JEDA = 0.35

TAHUN_AWAL, TAHUN_AKHIR = 1970, 2100
TAHUN_GROUND = [2026, 1997]                       # tahun dgn data harian penuh
TAHUN_GRID = [1970, 1980, 1985, 1993, 1995, 1997, 2000, 2002, 2003, 2010,
              2020, 2025, 2026, 2027, 2040, 2050, 2075, 2100]

BULAN = {"januari": 1, "pebruari": 2, "februari": 2, "maret": 3, "april": 4, "mei": 5,
         "juni": 6, "juli": 7, "agustus": 8, "september": 9, "oktober": 10,
         "nopember": 11, "november": 12, "desember": 12}

SAPTA = ["Redite", "Soma", "Anggara", "Buda", "Wraspati", "Sukra", "Saniscara"]
PANCA = {"Umanis", "Paing", "Pon", "Wage", "Keliwon", "Kasih"}

sesi = threading.local()


def http():
    if not hasattr(sesi, "s"):
        sesi.s = requests.Session()
        sesi.s.headers["User-Agent"] = UA
    return sesi.s


def ambil(path, params, simpan=None):
    """GET dgn cache di disk. Mengembalikan teks halaman (sudah didekode)."""
    if simpan and os.path.exists(simpan) and os.path.getsize(simpan) > 3000:
        return open(simpan, "rb").read().decode("cp1252", errors="replace")
    for _ in range(3):
        try:
            r = http().get(BASE + path, params=params, timeout=30)
            teks = r.content.decode("cp1252", errors="replace")
            if simpan:
                os.makedirs(os.path.dirname(simpan), exist_ok=True)
                open(simpan, "wb").write(r.content)
            time.sleep(JEDA)
            return teks
        except Exception:
            time.sleep(2)
    raise RuntimeError(f"gagal ambil {path} {params}")


def simpan_fixture(nama, data):
    os.makedirs(FIX, exist_ok=True)
    with open(os.path.join(FIX, nama), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    print(f"  -> fixtures/{nama}")


def bersih(s):
    """Halaman sumber campur encoding; buang sisa mojibake non-breaking space."""
    return re.sub(r"[ ÂÃ‚�]+", " ", s)


def teks_polos(h):
    h = re.sub(r"(?is)<(script|style|head)[^>]*>.*?</\1>", " ", h)
    h = re.sub(r"(?is)<br\s*/?>|</(tr|p|div|li|h\d|table|t[dh])>", "\n", h)
    h = re.sub(r"(?s)<[^>]+>", " ", h)
    return [" ".join(bersih(b).split()) for b in html.unescape(h).split("\n")]


# ------------------------------------------------------------------- anchors

def tahap_anchors():
    """Tanggal purnama & tilem beserta nama sasihnya — tulang punggung tabel sasih."""
    rows = []
    for th in range(TAHUN_AWAL, TAHUN_AKHIR + 1):
        t = ambil("purnamatilem.php", {"tahun": th}, os.path.join(RAW, "pt", f"{th}.html"))
        for baris in teks_polos(t):
            m = re.match(r"^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s*\.\s*(Purnama|Tilem)\s+(.+?)$", baris)
            if not m:
                continue
            hh, bl, yy, jenis, sasih = m.groups()
            bl = BULAN.get(bl.lower())
            if bl:
                rows.append((datetime.date(int(yy), bl, int(hh)).isoformat(), jenis, sasih))
        if th % 20 == 0:
            print("  ...", th)
    rows = sorted(set(rows))
    print(f"  {len(rows)} peristiwa")
    simpan_fixture("pt_events.json", rows)


# --------------------------------------------------------------------- rules

def tahap_rules():
    """220 ala-ayuning dewasa: nama, penjelasan, dan pola pemicunya."""
    t = ambil("referensialaayu.php", {}, os.path.join(RAW, "referensialaayu.html"))
    baris = [b for b in teks_polos(t) if b]
    i = baris.index("Wewaran Penyusun") + 1
    akhir = next(j for j, b in enumerate(baris) if b.startswith("Kembali ke Kalender"))
    isi = baris[i:akhir]
    if len(isi) % 3:
        raise SystemExit(f"struktur tabel berubah: {len(isi)} baris, harusnya kelipatan 3")
    aturan = [{"nama": isi[j], "penjelasan": isi[j + 1], "pola_raw": isi[j + 2]}
              for j in range(0, len(isi), 3)]
    print(f"  {len(aturan)} aturan")
    simpan_fixture("rules_raw.json", aturan)


# -------------------------------------------------------------------- ground

def _wewaran_harian(t):
    """Semua field berlabel `title` pada panel detail satu tanggal."""
    rec, wewukon = {}, []
    for judul, nilai in re.findall(r'title=\s*"([^"]*)"\s*>([^<]*)</a>', t):
        judul, nilai = " ".join(html.unescape(judul).split()), " ".join(html.unescape(nilai).split())
        if judul == "Wewukon":
            if nilai:
                wewukon.append(nilai)
        elif judul.startswith("Purnama, Tilem"):
            rec["Penanggal"] = nilai
        elif judul in ("Eka Wara", "Dwi Wara", "Tri Wara", "Catur Wara", "Panca Wara", "Sad Wara",
                       "Sapta Wara", "Asta Wara", "Sanga Wara", "Dasa Wara", "Sasih",
                       "Pratiti Samut Pada", "Ingkel Jejepan", "Watek", "Lintang", "Pararasan",
                       "Panca Suda", "Eka Jala Resi", "Urip Sapta Wara + Panca Wara"):
            rec[judul] = nilai
    rec["Wewukon"] = wewukon
    return rec


def tahap_ground():
    """Data pembanding: detail harian 2 tahun, grid bulanan lintas era, dan alaayu 2026."""
    harian, alaayu = {}, {}
    for th in TAHUN_GROUND:
        d = datetime.date(th, 1, 1)
        while d.year == th:
            p = {"bulan": d.month, "tanggal": d.day, "tahun": d.year}
            harian[d.isoformat()] = _wewaran_harian(
                ambil("", p, os.path.join(RAW, "day", f"{d.isoformat()}.html")))
            if th == TAHUN_GROUND[0]:
                t = ambil("alaayu.php", p, os.path.join(RAW, "alaayu", f"{d.isoformat()}.html"))
                nama = []
                for m in re.finditer(r"([A-Z][A-Za-z/,'\- ]{2,60}?)\s*\.\s*(.+?)\s*\(Alahing dewasa\s*(\d+)\)\.",
                                     "\n".join(teks_polos(t))):
                    nama.append(m.group(1).strip())
                alaayu[d.isoformat()] = nama
            d += datetime.timedelta(days=1)
        print("  detail harian", th, "selesai")
    simpan_fixture("gt_day.json", harian)
    simpan_fixture("gt_alaayu.json", alaayu)

    # Grid bulanan: satu request memberi saptawara+pancawara+wuku untuk sebulan penuh.
    pawukon = {}
    for th in TAHUN_GRID:
        for bl in range(1, 13):
            t = ambil("", {"bulan": bl, "tanggal": 15, "tahun": th},
                      os.path.join(RAW, "month", f"{th}-{bl:02d}.html"))
            akhir = (datetime.date(th + bl // 12, bl % 12 + 1, 1) - datetime.timedelta(days=1)).day
            for cls, judul, hh in re.findall(
                    r'class="(takaktif|bodikalender|libur)"><div>\s*<a[^>]*title="([^"]*)">(\d{1,2})<', t):
                if cls == "takaktif":
                    continue
                n = int(hh)
                if n > akhir:
                    continue
                trio = None
                for bagian in html.unescape(judul).split(","):
                    w = bagian.split()
                    if len(w) == 3 and w[0] in SAPTA and w[1] in PANCA:
                        trio = w
                if not trio:
                    continue
                tgl = datetime.date(th, bl, n)
                # Februari 28 hari = 4 minggu persis, jadi sel bulan tetangga bisa
                # lolos; cocokkan saptawara dengan hari Gregorian sebagai penjaga.
                if (tgl.weekday() + 1) % 7 != SAPTA.index(trio[0]):
                    continue
                pawukon[tgl.isoformat()] = [trio[0], "Keliwon" if trio[1] == "Kasih" else trio[1], trio[2]]
        print("  grid bulanan", th, "selesai")
    simpan_fixture("gt_pawukon.json", pawukon)


# ------------------------------------------------------------------ rerainan

RE_TGL = re.compile(r"^(\d{2})-(\d{2})-(\d{4})\s*\.\s*(.+?)\s*$")


def _potong(baris, mulai, henti):
    """Ambil baris di antara penanda `mulai` dan `henti` (kedua penanda dibuang)."""
    try:
        i = next(j for j, b in enumerate(baris) if b.startswith(mulai))
    except StopIteration:
        return []
    keluar = []
    for b in baris[i + 1:]:
        if b.startswith(henti):
            break
        keluar.append(b)
    return keluar


def tahap_rerainan():
    """Daftar rerainan & hari penting per bulan, dari halaman bulanan yang sama
    dengan tahap `ground` (jadi cache raw/month/ dipakai bersama)."""
    rerainan, penting = {}, {}
    for th in TAHUN_GRID:
        for bl in range(1, 13):
            t = ambil("", {"bulan": bl, "tanggal": 15, "tahun": th},
                      os.path.join(RAW, "month", f"{th}-{bl:02d}.html"))
            baris = [b for b in teks_polos(t) if b]
            for blok, tujuan in ((_potong(baris, "DAFTAR RERAINAN", "Untuk melihat rerainan"), rerainan),
                                 (_potong(baris, "HARI PERINGATAN", "Untuk melihat hari-hari penting"), penting)):
                for b in blok:
                    m = RE_TGL.match(b)
                    if not m:
                        continue
                    hh, mm, yy, nama = m.groups()
                    # Halaman bulanan kadang menyenggol tanggal bulan tetangga.
                    if int(yy) != th or int(mm) != bl:
                        continue
                    tujuan.setdefault(f"{yy}-{mm}-{hh}", []).append(nama)
        print("  rerainan", th, "selesai")
    for d in (rerainan, penting):
        for k in d:
            d[k] = sorted(set(d[k]))
    print(f"  {sum(len(v) for v in rerainan.values())} rerainan, "
          f"{sum(len(v) for v in penting.values())} hari penting")
    simpan_fixture("gt_rerainan.json", rerainan)
    simpan_fixture("gt_haripenting.json", penting)


# ------------------------------------------------------------------ karyaayu

# Tanggal lahir sampel untuk memvalidasi Karya Ayu. Dipilih supaya urip-nya
# mencakup keempat sisa bagi 4 (itu yang menentukan kategorinya), plus satu
# kelahiran di era penanggalan lain.
LAHIR_SAMPEL = ["1990-01-01", "1990-01-02", "1990-01-04", "1990-01-10",
                "1995-03-17", "1972-08-23"]
TAHUN_KARYA = [2026, 1997]

RE_KARYA = re.compile(r"^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s*\.\s*(Baik|Tidak Baik)\s*\(([A-Za-z]+)\)$")


def tahap_karyaayu():
    """Karya Ayu: kategori hari (Guru/Ratu/Sempoyong/Rogoh) menurut tanggal lahir.

    Satu request memberi sebulan penuh untuk satu kelahiran.
    """
    hasil = {}
    for lahir in LAHIR_SAMPEL:
        y, m, d = (int(x) for x in lahir.split("-"))
        per = {}
        for th in TAHUN_KARYA:
            for bl in range(1, 13):
                t = ambil("karyaayu.php",
                          {"tanggal1": d, "bulan1": m, "tahun1": y,
                           "bulan": bl, "tahun": th, "Submit": "Hasil"},
                          os.path.join(RAW, "karyaayu", f"{lahir}_{th}-{bl:02d}.html"))
                for baris in teks_polos(t):
                    mm = RE_KARYA.match(baris.strip())
                    if not mm:
                        continue
                    hh, nb, yy, nilai, kategori = mm.groups()
                    nb = BULAN.get(nb.lower())
                    if nb != bl or int(yy) != th:
                        continue
                    per[datetime.date(th, bl, int(hh)).isoformat()] = [kategori, nilai]
        hasil[lahir] = per
        print(f"  {lahir}: {len(per)} hari")
    simpan_fixture("gt_karyaayu.json", hasil)


# -------------------------------------------------------------------- alaayu

TAHUN_ALAAYU = [2026, 1997]                       # tahun penuh utk validasi

RE_ALAAYU = re.compile(
    r"([A-Z][A-Za-z/,'\- ]{2,60}?)\s*\.\s*(.+?)\s*\(Alahing dewasa\s*(\d+)\)\.")


def _alaayu_hari(iso):
    """Daftar (nama, alahing) yang ditampilkan situs untuk satu tanggal."""
    y, m, d = (int(x) for x in iso.split("-"))
    t = ambil("alaayu.php", {"bulan": m, "tanggal": d, "tahun": y},
              os.path.join(RAW, "alaayu", f"{iso}.html"))
    teks = "\n".join(teks_polos(t))
    return [(mm.group(1).strip(), int(mm.group(3))) for mm in RE_ALAAYU.finditer(teks)]


def tahap_alaayu():
    """Ala-ayuning dewasa harian: dua tahun penuh untuk validasi, plus tanggal
    probe terarah untuk melengkapi bobot alahing.

    Tanggal probe datang dari `node scripts/bali-calendar/probe-dewasa.mjs`:
    satu tanggal per kalimat pola, jadi bobot bisa dipetakan ke kalimatnya —
    belasan request, bukan tahun penuh.
    """
    harian = {}
    for th in TAHUN_ALAAYU:
        d = datetime.date(th, 1, 1)
        while d.year == th:
            harian[d.isoformat()] = _alaayu_hari(d.isoformat())
            d += datetime.timedelta(days=1)
        print(f"  {th} selesai")

    jalur = os.path.join(FIX, "probe_dewasa.json")
    if os.path.exists(jalur):
        probe = json.load(open(jalur, encoding="utf-8"))
        baru = [t for t in probe["tanggal"] if t not in harian]
        for i, t in enumerate(baru):
            harian[t] = _alaayu_hari(t)
            if (i + 1) % 25 == 0:
                print(f"  probe {i + 1}/{len(baru)}")
        print(f"  {len(baru)} tanggal probe selesai")
    else:
        print("  (probe_dewasa.json belum ada — jalankan probe-dewasa.mjs dulu)")

    bobot = {}
    for daftar in harian.values():
        for nama, n in daftar:
            bobot.setdefault(nama, set()).add(n)
    simpan_fixture("gt_alaayu.json", {k: v for k, v in sorted(harian.items())})
    simpan_fixture("alahing.json", {k: sorted(v) for k, v in sorted(bobot.items())})
    print(f"  {len(harian)} hari, {len(bobot)} aturan berbobot")


# ----------------------------------------------------------------- crosscheck

BASE2 = "https://www.kalenderbali.com/"
RE_HARI2 = re.compile(r'data-tgl="([^"]*)"\s+data-detail="([^"]*)"')


def tahap_crosscheck():
    """Panen sumber kedua (kalenderbali.com) untuk bulan-bulan terpilih.

    Tampilan klasiknya menyematkan seluruh field satu hari sebagai JSON di
    atribut `data-detail`, jadi satu request per bulan sudah memberi data
    pembanding yang lengkap. Bulan yang dipanen dipilih oleh
    `pilih-bulan-crosscheck.mjs` — sengaja menumpuk di nampih sasih, mala sasih,
    dan ngunaratri, tempat kalender paling mungkin berbeda.
    """
    bulan = json.load(open(os.path.join(FIX, "crosscheck_bulan.json"), encoding="utf-8"))
    hasil = {}
    for b in bulan:
        th, bl = (int(x) for x in b.split("-"))
        simpan = os.path.join(RAW, "kbcom", f"{b}.html")
        if os.path.exists(simpan) and os.path.getsize(simpan) > 3000:
            t = open(simpan, "rb").read().decode("utf-8", errors="replace")
        else:
            r = http().get(BASE2, params={"bl": bl, "th": th, "tampilkan": "Tampilkan"}, timeout=30)
            t = r.text
            os.makedirs(os.path.dirname(simpan), exist_ok=True)
            open(simpan, "w", encoding="utf-8").write(t)
            time.sleep(JEDA)
        for tgl, det in RE_HARI2.findall(t):
            tgl = " ".join(html.unescape(tgl).split())
            m = re.match(r"^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$", tgl)
            if not m:
                continue
            hh, nb, yy = m.groups()
            nb = BULAN.get(nb.lower())
            if not nb or int(yy) != th or nb != bl:
                continue           # halaman bulanan ikut memuat hari tetangga
            hasil[datetime.date(th, bl, int(hh)).isoformat()] = json.loads(html.unescape(det))
        print(f"  {b} selesai ({len(hasil)} hari terkumpul)")
    simpan_fixture("gt_kbcom.json", {k: v for k, v in sorted(hasil.items())})
    print(f"  {len(hasil)} hari dari {len(bulan)} bulan")


# -------------------------------------------------------------------- arti

# Jumlah nilai tiap komponen; dipakai untuk tahu kapan panen boleh berhenti.
# Ekawara hanya punya satu nilai bermakna ("Luang"); hari non-Luang ditandai "-"
# dan situs sumber tidak memberi tafsir untuknya.
KARDINALITAS = {"Ekawara": 1, "Dwiwara": 2, "Triwara": 3, "Caturwara": 4, "Pancawara": 5,
                "Sadwara": 6, "Saptwara": 7, "Astawara": 8, "Sangawara": 9, "Dasawara": 10,
                "Wuku": 30, "Lintang": 35, "Tanggal": 30, "Ekajalaresi": 31,
                "Pararasan": 10, "Pancasuda": 7, "Pratiti": 12}
RE_ARTI = re.compile(r"^([A-Za-z]+):\s*(.+?)$")


def tahap_arti():
    """Teks tafsir tiap wara, wuku, lintang, pararasan, pancasuda, dan pratiti.

    Tiap komponen punya himpunan nilai yang terbatas, jadi tidak perlu memanen
    tiap tanggal — cukup jalan maju sampai semua nilai pernah terlihat. Biasanya
    berhenti jauh sebelum batas.
    """
    hasil = {}
    d = datetime.date(2026, 1, 1)
    batas = d + datetime.timedelta(days=430)
    while d < batas:
        t = ambil("artihari.php", {"bulan": d.month, "tanggal": d.day, "tahun": d.year},
                  os.path.join(RAW, "arti", f"{d.isoformat()}.html"))
        baris = [b for b in teks_polos(t) if b]
        for i, b in enumerate(baris[:-1]):
            m = RE_ARTI.match(b)
            if not m or m.group(1) not in KARDINALITAS:
                continue
            bidang, nilai = m.group(1), m.group(2).strip()
            teks = baris[i + 1].strip()
            if not teks or RE_ARTI.match(teks):
                continue
            hasil.setdefault(bidang, {}).setdefault(nilai, teks)
        if all(len(hasil.get(k, {})) >= n for k, n in KARDINALITAS.items()):
            print(f"  seluruh nilai terliput pada {d.isoformat()}")
            break
        if d.day == 1:
            print(f"  ... {d.isoformat()}: {sum(len(v) for v in hasil.values())} nilai terkumpul")
        d += datetime.timedelta(days=1)

    for k, n in KARDINALITAS.items():
        ada = len(hasil.get(k, {}))
        if ada < n:
            print(f"  PERINGATAN: {k} baru {ada}/{n} nilai")
    simpan_fixture("arti_wara.json", {k: dict(sorted(v.items())) for k, v in sorted(hasil.items())})
    print(f"  {sum(len(v) for v in hasil.values())} tafsir di {len(hasil)} komponen")


# ----------------------------------------------------------------- dauh ayu

# Bulan sampel untuk menguji bahwa dauh ayu memang hanya bergantung saptawara:
# dua musim, tiga era penanggalan.
BULAN_DAUH = [(2026, 9), (2026, 1), (1997, 6), (2050, 3)]
RE_DAUH = re.compile(r"^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\.\s*Jam\s*:\s*(.+?)$")


def tahap_dauhayu():
    """Dauh ayu — pembagian waktu baik dalam sehari.

    Ternyata hanya bergantung saptawara: 120 hari sampel di empat bulan lintas
    musim dan era memberi rentang jam yang sama persis untuk tiap saptawara.
    Jadi yang disimpan tabel tujuh sel, bukan data harian.
    """
    per = {}
    for th, bl in BULAN_DAUH:
        t = ambil("dauhayu.php", {"bulan": bl, "tahun": th, "Submit": "Hasil"},
                  os.path.join(RAW, "dauhayu", f"{th}-{bl:02d}.html"))
        for b in teks_polos(t):
            m = RE_DAUH.match(b.strip())
            if not m:
                continue
            hh, nb, yy, jam = m.groups()
            nb = BULAN.get(nb.lower())
            if nb != bl or int(yy) != th:
                continue
            d = datetime.date(th, bl, int(hh))
            sw = SAPTA[((d - datetime.date(1970, 1, 1)).days + 32) % 210 % 7]
            per.setdefault(sw, set()).add(jam.strip())
        print(f"  {th}-{bl:02d} selesai")

    goyah = {k: sorted(v) for k, v in per.items() if len(v) > 1}
    if goyah:
        raise SystemExit("dauh ayu tidak konstan per saptawara: " + json.dumps(goyah, ensure_ascii=False))
    if len(per) != 7:
        raise SystemExit(f"hanya {len(per)}/7 saptawara terliput")

    hasil = {}
    for sw, v in per.items():
        hasil[sw] = re.findall(r"\[(\d{2}\.\d{2})\s*-\s*(\d{2}\.\d{2})\]", next(iter(v)))
    simpan_fixture("dauh_ayu.json", {k: hasil[k] for k in SAPTA})
    print(f"  {sum(len(v) for v in hasil.values())} rentang jam di 7 saptawara")


# --------------------------------------------------------------------- skips

def _angka_tithi(d, cache, kunci):
    k = d.isoformat()
    with kunci:
        if k in cache:
            return cache[k]
    t = ambil("", {"bulan": d.month, "tanggal": d.day, "tahun": d.year})
    m = re.search(r'title=\s*"Purnama, Tilem, Penanggal, dan Pangelong"\s*>\s*([^<]*?)\s*</a>', t)
    v = m.group(1).strip()
    n = 15 if v in ("Purnama", "Tilem") else int(re.match(r"(?:Penanggal|Pangelong)\s+(\d+)", v).group(1))
    with kunci:
        cache[k] = n
    return n


def tahap_skips():
    """Cari angka penanggal/pangelong yang dilewati pada setengah-bulan 14 hari.

    Binary search: di hari ke-k, angka yang tampil = k kalau skip ada setelahnya,
    dan k+1 kalau skip sudah lewat. Empat probe cukup untuk 14 kemungkinan.
    """
    D = datetime.date.fromisoformat
    ev = [tuple(x) for x in json.load(open(os.path.join(FIX, "pt_events.json"), encoding="utf-8"))]
    pendek = [(D(ev[i - 1][0]), D(ev[i][0])) for i in range(1, len(ev))
              if (D(ev[i][0]) - D(ev[i - 1][0])).days == 14]

    jalur = os.path.join(FIX, "skips.json")
    hasil = json.load(open(jalur, encoding="utf-8")) if os.path.exists(jalur) else {}
    cacheJalur = os.path.join(RAW, "daycache.json")
    cache = json.load(open(cacheJalur, encoding="utf-8")) if os.path.exists(cacheJalur) else {}
    kunci = threading.Lock()

    antre = queue.Queue()
    for a, b in pendek:
        if a.isoformat() not in hasil:
            antre.put((a, b))
    total = antre.qsize()
    print(f"  {len(pendek)} setengah-bulan berskip, {total} belum terselesaikan")

    def pekerja():
        while True:
            try:
                a, _b = antre.get_nowait()
            except queue.Empty:
                return
            try:
                lo, hi = 1, 14
                while lo < hi:
                    mid = (lo + hi) // 2
                    if _angka_tithi(a + datetime.timedelta(days=mid), cache, kunci) == mid:
                        lo = mid + 1
                    else:
                        hi = mid
                with kunci:
                    hasil[a.isoformat()] = lo
            except Exception as e:
                print("  GAGAL", a, e, flush=True)

    ts = [threading.Thread(target=pekerja) for _ in range(2)]
    for t in ts:
        t.start()
    for t in ts:
        t.join()

    os.makedirs(RAW, exist_ok=True)
    json.dump(cache, open(cacheJalur, "w", encoding="utf-8"))
    print(f"  {len(hasil)}/{len(pendek)} terselesaikan")
    simpan_fixture("skips.json", hasil)


TAHAP = {"anchors": tahap_anchors, "rules": tahap_rules, "ground": tahap_ground,
         "rerainan": tahap_rerainan, "karyaayu": tahap_karyaayu,
         "alaayu": tahap_alaayu, "crosscheck": tahap_crosscheck, "arti": tahap_arti, "dauhayu": tahap_dauhayu, "skips": tahap_skips}

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in TAHAP:
        raise SystemExit(f"pakai: python {os.path.basename(__file__)} [{' | '.join(TAHAP)}]")
    nama = sys.argv[1]
    print(f"Tahap {nama} ...")
    TAHAP[nama]()
    print("Selesai. Lanjut: python scripts/bali-calendar/build.py")
