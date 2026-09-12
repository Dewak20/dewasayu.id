"""Bangun ulang lib/bali-calendar/data/*.js dari fixtures/.

    python scripts/bali-calendar/build.py

Fixtures dipanen dari kalenderbali.org lewat scrape.py. Skrip ini tidak
menyentuh jaringan — hanya mengubah fixtures jadi modul JS yang dipakai mesin.
"""

import json
import os
import re
import datetime

DIR = os.path.dirname(os.path.abspath(__file__))
FIX = os.path.join(DIR, "fixtures")
OUT = os.path.normpath(os.path.join(DIR, "..", "..", "lib", "bali-calendar", "data"))

SAPTA = ["Redite", "Soma", "Anggara", "Buda", "Wraspati", "Sukra", "Saniscara"]
PANCA = ["Umanis", "Paing", "Pon", "Wage", "Keliwon"]
TRI = ["Pasah", "Beteng", "Kajeng"]
CAT = ["Sri", "Laba", "Jaya", "Menala"]
SAD = ["Tungleh", "Aryang", "Urukung", "Paniron", "Was", "Maulu"]
AST = ["Sri", "Indra", "Guru", "Yama", "Ludra", "Brahma", "Kala", "Uma"]
SAN = ["Dangu", "Jangur", "Gigis", "Nohan", "Ogan", "Erangan", "Urungan", "Tulus", "Dadi"]
DAS = ["Pandita", "Pati", "Suka", "Duka", "Sri", "Manuh", "Manusa", "Raja", "Dewa", "Raksasa"]
DWI = ["Menga", "Pepet"]
EKA = ["Luang"]
WUKU = ["Sinta", "Landep", "Ukir", "Kulantir", "Tolu", "Gumbreg", "Wariga", "Warigadean",
        "Julungwangi", "Sungsang", "Dunggulan", "Kuningan", "Langkir", "Medangsia", "Pujut",
        "Pahang", "Krulut", "Merakih", "Tambir", "Medangkungan", "Matal", "Uye", "Menail",
        "Prangbakat", "Bala", "Ugu", "Wayang", "Kulawu", "Dukut", "Watugunung"]
SASIH = ["Kasa", "Karo", "Ketiga", "Kapat", "Kelima", "Kenam",
         "Kepitu", "Kewulu", "Kesanga", "Kedasa", "Jiyestha", "Sadha"]

ALIAS = {"Kliwon": "Keliwon", "Dungulan": "Dunggulan", "Klawu": "Kulawu", "Katiga": "Ketiga",
         "Kalima": "Kelima", "Kanem": "Kenam", "Kapitu": "Kepitu", "Kawolu": "Kewulu",
         "Kasanga": "Kesanga", "Kadasa": "Kedasa", "Jyestha": "Jiyestha", "Destha": "Jiyestha",
         "Jestha": "Jiyestha"}

SIKLUS = [(SAPTA, "saptawara"), (PANCA, "pancawara"), (TRI, "triwara"), (CAT, "caturwara"),
          (SAD, "sadwara"), (AST, "astawara"), (SAN, "sangawara"), (DAS, "dasawara"),
          (DWI, "dwiwara"), (EKA, "ekawara"), (WUKU, "wuku"), (SASIH, "sasih")]

MILIK = {}
for daftar, siklus in SIKLUS:
    for nama in daftar:
        MILIK.setdefault(nama, []).append(siklus)

# Koreksi empiris, ditemukan dengan membandingkan mesin ini terhadap keluaran
# harian kalenderbali.org sepanjang 2026 (lihat lib/bali-calendar/README.md).
TAMBAHAN = {
    "Kala Buingrau": [
        [{"t": "wara", "cycle": "saptawara", "v": "Soma"}, {"t": "wara", "cycle": "pancawara", "v": "Umanis"}],
        [{"t": "wara", "cycle": "saptawara", "v": "Sukra"}, {"t": "wara", "cycle": "astawara", "v": "Ludra"}],
    ],
}
# "Soma Uma" di halaman referensi Kala Buingrau ternyata pemotongan dari
# "Soma Umanis", bukan astawara Uma seperti pada Lebur Awu.
HAPUS = {"Kala Buingrau": [[("saptawara", "Soma"), ("astawara", "Uma")]]}

# Kata kunci dicocokkan di **awal kata**, bukan sebagai potongan bebas. Aturan
# substring bebas sempat membuat "ikan" ikut kena pada "pelantikan" dan
# "memberikan"; pencocokan awal-kata membuang itu tanpa kehilangan bentuk
# berimbuhan akhir seperti "tanaman". Konsekuensinya bentuk berawalan harus
# ditulis eksplisit ("menanam" tidak memuat "tanam" sebagai awalan kata).
TAG = {
    "pernikahan": ["nikah", "menikah", "pernikahan", "wiwaha", "pawiwahan", "perkawinan",
                   "kawin", "meminang", "pinang", "pengant", "mempelai", "jodoh",
                   "senggama", "berenggama", "bersenggama"],
    "yadnya": ["yadnya", "upacara", "piodalan", "pemujaan", "memuja", "pura", "melaspas",
               "sanggah", "merajan", "dewasa ayu", "karya ayu", "gawe ayu", "penyucian",
               "pebersihan", "pembersihan", "bersuci", "mecaru", "caru"],
    "bangunan": ["bangun", "membangun", "pembangunan", "bangunan", "mengatapi", "atap",
                 "rumah", "perumahan", "tembok", "pagar", "pekarangan", "bendungan",
                 "empangan", "sumur", "irigasi", "kolam", "terowongan", "tangga", "gudang",
                 "pindah rumah"],
    "usaha": ["usaha", "dagang", "berdagang", "dagangan", "berjualan", "jualan", "menjual",
              "beli", "membeli", "meminjam", "pinjam", "rejeki", "perusahaan",
              "nafkah", "pengupa jiwa", "berbelanja", "belanja"],
    "pertanian": ["tanam", "menanam", "penanaman", "tanaman", "bercocok", "pertanian",
                  "padi", "jagung", "kacang", "kebun", "perkebunan", "sawah", "tegal",
                  "lumbung", "panen", "bibit", "memetik", "petik", "buah", "umbi",
                  "kelapa", "sirih", "tembakau", "tebu", "mentimun", "bajak", "membajak",
                  "menyadap", "ngirisin", "beras"],
    "ternak": ["ternak", "peternakan", "sapi", "banteng", "kerbau", "ayam", "babi", "kambing",
               "itik", "kuda", "lebah", "wewalungan", "berburu", "ikan", "perikanan",
               "mepikat", "mapikat", "sabungan", "tajen", "hewan", "binatang", "burung",
               "peliharaan", "memelihara"],
    "perjalanan": ["bepergian", "pergi", "berkunjung", "pindah", "perjalanan"],
    "pendidikan": ["belajar", "pelajaran", "berlatih", "melatih", "mengajar", "menari",
                   "menabuh", "sekolah", "perguruan", "petuah", "nasehat", "nasihat"],
    "manusa_yadnya": ["potong gigi", "potong rambut", "mapandes", "mapendes", "metatah",
                      "manusa yadnya", "magundul", "macukur", "melas rare"],
    "pitra_yadnya": ["atiwa-tiwa", "ngaben", "mayat", "mengubur", "kubur", "membakar mayat",
                     "pitra", "nyekah", "ngasti", "penguburan", "leluhur"],
    "pertemuan": ["pertemuan", "rapat", "perundingan", "perkumpulan", "organisasi", "kampanye",
                  "gotong"],
    "jabatan": ["melantik", "pelantikan", "mengangkat", "pejabat", "petugas", "pengurus",
                "awig-awig", "peraturan", "undang-undang"],
    # Kategori baru, mengikuti pengelompokan situs sumber sendiri
    # ("Peralatan-Senjata"): seperempat korpus bicara soal membuat alat.
    "peralatan": ["senjata", "keris", "tombak", "taji", "pisau", "pengiris", "alat",
                  "anyam", "anyaman", "sok", "jaring", "jala", "pancing", "kail", "bubu",
                  "seser", "pencar", "perangkap", "jebag", "jerat", "tali", "garu", "lampit",
                  "gambelan", "gamelan", "kentongan", "genta", "kendang", "bedug", "tenun",
                  "cagcag", "topeng", "tapel", "barong", "jimat", "sesikepan", "ranjau",
                  "lelakut", "penakut", "pande", "besi", "almari", "dungki", "keranjang"],
}

# Beberapa penjelasan tidak bisa ditangkap kata kunci apa pun — kalimatnya
# menyebut kegiatan tanpa menamainya, atau justru menyebut kategori yang tidak
# dimaksud. Koreksi hasil pembacaan manual ke-220 penjelasan ditulis di sini
# supaya tidak hilang saat data dibangun ulang.
#   nama: (tambah_baik, tambah_buruk, buang_baik, buang_buruk)
KOREKSI_TAG = {
    # "sesirep" = pengasih/penidur, bukan kegiatan bertani atau membangun.
    "Babi Turun": ([], [], [], []),
    # "menyetem gambelan" sudah kena peralatan lewat "gambelan".
    # "mencuri demi kepentingan umum" bukan salah satu dari 13 kategori.
    "Kala Klingkung": ([], [], [], []),
    # Kalimatnya soal sifat hari, bukan kegiatan tertentu.
    "Kala Brahma": ([], [], [], []),
    "Kala Ingsor": ([], [], [], []),
    # "menghilangkan yang angker" & "meramu obat" — tidak ada kategori obat.
    "Agni Agung Patra Limutan": ([], [], [], []),
    # "membuka jalan air"/"saluran air" masuk pekerjaan air, dekat ke bangunan.
    "Kala Keciran": (["bangunan"], [], [], []),
    "Banyu Milir": ([], [], [], []),
    # "memasang guna-guna" bukan kategori mana pun.
    "Patra Limutan": ([], [], [], []),
    # "membuat jukung" (perahu) bukan bangunan rumah, tapi tetap pekerjaan kayu.
    "Dewasa Ngelayang": ([], [], [], []),
    # Situs sumber menulis "mananam kepaya" — salah ketik dari "menanam pepaya".
    "Ratu Nanyingal": (["pertanian"], [], [], []),
    # "tepis" dan "sabang" adalah perkakas; tak ada kata kunci yang menangkapnya.
    "Kala Susulan": (["peralatan"], [], [], []),
}


def muat(nama):
    with open(os.path.join(FIX, nama), encoding="utf-8") as f:
        return json.load(f)


def tulis(nama, data):
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, nama)
    with open(path, "w", encoding="utf-8") as f:
        f.write("export default ")
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")
    print(f"  {nama}  {os.path.getsize(path):,} bytes")


# --------------------------------------------------------------- aturan dewasa

def urai_pola(pola):
    """Ubah teks pola jadi OR-dari-AND. Tiap kalimat dipisah titik."""
    kondisi = []
    for kalimat in pola.split("."):
        s = " ".join(kalimat.replace("�", " ").split())
        if not s:
            continue
        if re.match(r"^(Penanggal|Pangelong)\s*=\s*Sasih$", s):
            kondisi.append([{"t": "tithi_eq_sasih", "phase": s.split()[0].lower()}])
            continue
        tok = s.split()
        c = []
        i = 0
        gagal = False
        while i < len(tok):
            w = re.sub(r"[^A-Za-z]", "", tok[i])
            w = ALIAS.get(w, w)
            if w in ("Penanggal", "Pangelong"):
                angka = re.sub(r"[^0-9]", "", tok[i + 1]) if i + 1 < len(tok) else ""
                if angka:
                    c.append({"t": "tithi", "phase": w.lower(), "n": int(angka)})
                    i += 2
                else:
                    c.append({"t": "phase", "phase": w.lower()})
                    i += 1
                continue
            if w in ("Purnama", "Tilem"):
                c.append({"t": "tithi", "phase": "penanggal" if w == "Purnama" else "pangelong", "n": 15})
                i += 1
                continue
            siklus = MILIK.get(w)
            if not siklus:
                gagal = True
                break
            c.append({"t": "wara", "cycle": siklus[0] if len(siklus) == 1 else None,
                      "cands": siklus, "v": w})
            i += 1
        if gagal or not c:
            continue
        # Hanya "Sri" yang ambigu. Diuji terhadap keluaran harian 2026:
        # "Sri Sri" = caturwara + astawara, "Sri" tunggal = astawara.
        ambigu = [x for x in c if x["t"] == "wara" and not x["cycle"]]
        urutan = ["caturwara", "astawara"] if len(ambigu) == 2 else ["astawara"]
        for j, x in enumerate(ambigu):
            x["cycle"] = urutan[j] if j < len(urutan) and urutan[j] in x["cands"] else x["cands"][0]
        for x in c:
            x.pop("cands", None)
        kondisi.append(c)
    return kondisi


def klausa(penjelasan):
    """Pecah penjelasan jadi klausa dan tandai mana yang negatif."""
    hasil = []
    for bagian in re.split(r"(?<=[.])\s+|\.\s*$", penjelasan):
        bagian = bagian.strip()
        if not bagian:
            continue
        # Sebagian penjelasan menaruh "tidak baik" di tengah kalimat dengan huruf
        # kecil ("Bersifat panas, tidak baik membangun rumah") — kalau pemisahan
        # hanya mengenali huruf besar, klausa negatifnya ikut terbaca positif.
        for sub in re.split(r"(?i)(?=\b(?:tidak|tidka)\s+baik)", bagian):
            sub = sub.strip(" .,")
            if sub:
                hasil.append((bool(re.match(r"(?i)^(tidak|tidka)\s+baik", sub)), sub))
    return hasil


TAG_RE = {k: re.compile(r"\b(?:" + "|".join(re.escape(w) for w in kata) + r")", re.I)
          for k, kata in TAG.items()}


def tag_dari(teks):
    return sorted(k for k, pola in TAG_RE.items() if pola.search(teks))


def bobot_per_pola(nama, kondisi, alahing, probe, harian):
    """Alahing untuk tiap kalimat pola sebuah aturan.

    Sebagian aturan diberi alahing berbeda oleh situs sumber tergantung kalimat
    pola mana yang cocok. `probe_dewasa.json` menyimpan tanggal yang hanya cocok
    dengan satu kalimat, jadi angka yang muncul pada tanggal itu bisa dipastikan
    milik kalimat itu. Kalimat yang tidak punya tanggal khas memakai bobot
    seragam aturannya — kalau memang cuma ada satu.
    """
    semua = alahing.get(nama)
    seragam = semua[0] if semua and len(semua) == 1 else None
    per = [seragam] * len(kondisi)
    for i, tanggal in enumerate(probe.get(nama, [])):
        if i >= len(per):
            break
        for t in tanggal:
            for n, b in harian.get(t, []):
                if n == nama:
                    per[i] = b
    return per


def bangun_dewasa():
    mentah = muat("rules_raw.json")
    alahing = muat("alahing.json")
    probe = muat("probe_dewasa.json")["perAturan"]
    harian = muat("gt_alaayu.json")
    out = []
    for r in mentah:
        kondisi = urai_pola(r["pola_raw"])
        buang = HAPUS.get(r["nama"], [])
        if buang:
            def cocok(kal, pola):
                return sorted((k["cycle"], k["v"]) for k in kal if k["t"] == "wara") == sorted(pola)
            kondisi = [k for k in kondisi if not any(cocok(k, p) for p in buang)]
        kondisi += TAMBAHAN.get(r["nama"], [])

        kl = klausa(r["penjelasan"])
        baik_untuk, buruk_untuk = set(), set()
        for negatif, teks in kl:
            for t in tag_dari(teks):
                (buruk_untuk if negatif else baik_untuk).add(t)
        tambah_b, tambah_r, buang_b, buang_r = KOREKSI_TAG.get(r["nama"], ([], [], [], []))
        baik_untuk = (baik_untuk | set(tambah_b)) - set(buang_b)
        buruk_untuk = (buruk_untuk | set(tambah_r)) - set(buang_r)

        bobot = alahing.get(r["nama"])
        per_pola = bobot_per_pola(r["nama"], kondisi, alahing, probe, harian)
        out.append({
            "nama": r["nama"], "penjelasan": r["penjelasan"], "polaRaw": r["pola_raw"],
            "kondisi": kondisi,
            "baik": any(not n for n, _ in kl), "buruk": any(n for n, _ in kl),
            "baikUntuk": sorted(baik_untuk), "burukUntuk": sorted(buruk_untuk),
            "alahing": bobot[0] if bobot and len(bobot) == 1 else None,
            "alahingPola": per_pola,
            "alahingVarian": bobot if bobot and len(bobot) > 1 else None,
            "tag": sorted(baik_untuk | buruk_untuk),
        })
    tanpa = [r["nama"] for r in out if r["alahing"] is None and not any(x is not None for x in r["alahingPola"])]
    belum = sum(1 for r in out for x in r["alahingPola"] if x is None)
    tulis("dewasa.js", out)
    print(f"  ({len(out)} aturan, {belum} kalimat pola tanpa bobot"
          + (f", tanpa bobot sama sekali: {', '.join(tanpa)}" if tanpa else "") + ")")


# ----------------------------------------------------------------------- sasih

def bangun_sasih():
    ev = [tuple(x) for x in muat("pt_events.json")]
    skips = muat("skips.json")
    D = datetime.date.fromisoformat

    gaps, sasih, prefix, skip = [], [], [], []
    belum = 0
    for i, (tgl, _kind, label) in enumerate(ev):
        if i > 0:
            gaps.append((D(tgl) - D(ev[i - 1][0])).days)
        sasih.append(SASIH.index(label.replace("Mala ", "").replace("Nampih ", "")))
        prefix.append(1 if label.startswith("Mala ") else 2 if label.startswith("Nampih ") else 0)
        if i == 0:
            skip.append(0)
            continue
        g = (D(tgl) - D(ev[i - 1][0])).days
        if g == 15:
            skip.append(0)
        else:
            s = skips.get(ev[i - 1][0])
            if s is None:
                belum += 1
                s = 0
            skip.append(s)

    # Unit sasih. Pada era "purnama-akhir" (1993-2002) unit dibuka oleh Tilem dan
    # nama sasih sudah berganti pada hari Tilem itu sendiri.
    base = D(ev[0][0])
    unit_awal, unit_sasih, unit_prefix, saka = [], [], [], []
    i = 0
    while i < len(ev) - 1:
        if ev[i][2] != ev[i + 1][2]:
            i += 1
            continue
        if ev[i][1] == "Tilem":
            awal = D(ev[i][0])
        elif i > 0:
            awal = D(ev[i - 1][0]) + datetime.timedelta(days=1)
        else:
            awal = None
        if awal:
            label = ev[i][2]
            p = 1 if label.startswith("Mala ") else 2 if label.startswith("Nampih ") else 0
            dasar = label.replace("Mala ", "").replace("Nampih ", "")
            unit_awal.append((awal - base).days)
            unit_sasih.append(SASIH.index(dasar))
            unit_prefix.append(p)
            if label == "Kedasa":  # tahun Saka berganti pada penanggal 1 Kedasa
                saka.append((awal - base).days)
                saka.append(awal.year - 78)
        i += 2

    if belum:
        print(f"  PERINGATAN: {belum} posisi ngunaratri belum terselesaikan")
    tulis("sasih.js", {
        "epoch": ev[0][0], "kindPertama": 0 if ev[0][1] == "Purnama" else 1,
        "sasihNama": SASIH, "gaps": gaps, "sasih": sasih, "prefix": prefix, "skip": skip,
        "awalSaka": saka, "unitAwal": unit_awal, "unitSasih": unit_sasih, "unitPrefix": unit_prefix,
    })
    print(f"  ({len(ev)} peristiwa purnama-tilem, {len(unit_awal)} unit sasih)")


# -------------------------------------------------------------------- rerainan

# Rerainan yang bersumber dari sasih (purnama/tilem dan turunannya) dihitung di
# mesin, bukan ditabelkan — pola namanya mengikuti nama sasih hari itu.
SASIH_RE = re.compile(r"^(Purnama|Tilem)\b")
DIHITUNG = {"Hari Raya Nyepi", "Ngembak Geni", "Hari Siwa Ratri"}
KAJENG_RE = re.compile(r"^Ka[jl]eng Keliwon\b")   # situs sumber menulis "Kaleng" pd penanggal 8

RAYA = {"Hari Raya Galungan", "Hari Raya Kuningan", "Hari Raya Saraswati", "Pagerwesi",
        "Hari Raya Nyepi", "Ngembak Geni", "Hari Siwa Ratri", "Banyu Pinaruh"}


def jenis_rerainan(nama):
    if nama in RAYA:
        return "raya"
    if nama.startswith("Tumpek"):
        return "tumpek"
    if KAJENG_RE.match(nama):
        return "kajeng-keliwon"
    if SASIH_RE.match(nama):
        return "purnama-tilem"
    return "biasa"


def indeks_pawukon(d):
    return ((d - datetime.date(1970, 1, 1)).days + 32) % 210


def bangun_rerainan():
    """Tabel rerainan per indeks pawukon + tabel hari penting nasional.

    Keduanya diturunkan dari daftar bulanan kalenderbali.org (18 tahun sampel,
    lintas tiga era penanggalan). Sebuah nama hanya masuk tabel pawukon kalau ia
    muncul pada *semua* kemunculan indeks itu di seluruh sampel — kalau tidak,
    berarti sumbernya bukan pawukon murni dan tidak boleh ditabelkan.
    """
    gt = muat("gt_rerainan.json")
    tanggal = sorted(gt)
    tahun = sorted({int(t[:4]) for t in tanggal})

    total = [0] * 210
    for th in tahun:
        d = datetime.date(th, 1, 1)
        while d.year == th:
            total[indeks_pawukon(d)] += 1
            d += datetime.timedelta(days=1)

    hitung = {}
    for t, nama in gt.items():
        i = indeks_pawukon(datetime.date.fromisoformat(t))
        for n in nama:
            if SASIH_RE.match(n) or n in DIHITUNG or KAJENG_RE.match(n):
                continue
            hitung.setdefault(i, {}).setdefault(n, 0)
            hitung[i][n] += 1

    tabel, goyah = [None] * 210, []
    for i, isi in hitung.items():
        tetap = sorted(n for n, c in isi.items() if c == total[i])
        goyah += [f"pawukon {i}: {n} {c}/{total[i]}" for n, c in isi.items() if c != total[i]]
        if tetap:
            tabel[i] = [[n, jenis_rerainan(n)] for n in tetap]
    if goyah:
        raise SystemExit("rerainan tidak konsisten per indeks pawukon:\n  " + "\n  ".join(goyah))

    penting = muat("gt_haripenting.json")
    per_hari, bergeser = {}, []
    for t, nama in penting.items():
        per_hari.setdefault(t[5:], set()).update(nama)
    milik = {}
    for md, nama in per_hari.items():
        for n in nama:
            milik.setdefault(n, []).append(md)
    bergeser = sorted(n for n, v in milik.items() if len(v) > 1)
    if bergeser:
        raise SystemExit("hari penting tidak bertanggal tetap: " + ", ".join(bergeser))
    nasional = {md: sorted(n) for md, n in sorted(per_hari.items())}

    tulis("rerainan.js", {"pawukon": tabel, "nasional": nasional})
    terisi = sum(1 for x in tabel if x)
    print(f"  ({terisi}/210 indeks pawukon berrerainan, {len(milik)} hari penting nasional, "
          f"{len(tahun)} tahun sampel)")


def bangun_wewukon(gt_day):
    """Label Wewukon per wuku (Lanus, Basah Gede, Was Penganten, dan seterusnya).

    Panel harian kalenderbali.org menampilkannya seolah milik hari itu, tapi
    tampilan klasik kalenderbali.com menaruhnya di kepala kolom wuku — dan
    memang begitu: sepanjang 730 hari (1997 dan 2026, dua era penanggalan)
    daftarnya tidak pernah berubah di dalam satu wuku, 21-28 sampel per wuku.
    Jadi bentuknya tabel 30 sel, bukan aturan harian.
    """
    per = {}
    for iso, rec in gt_day.items():
        d = datetime.date.fromisoformat(iso)
        w = indeks_pawukon(d) // 7
        label = tuple(rec.get("Wewukon") or [])
        per.setdefault(w, set()).add(label)
    bentrok = {w: v for w, v in per.items() if len(v) > 1}
    if bentrok:
        raise SystemExit("Wewukon tidak konstan dalam wuku: "
                         + ", ".join(f"{WUKU[w]}={sorted(v)}" for w, v in bentrok.items()))
    if len(per) != 30:
        raise SystemExit(f"hanya {len(per)}/30 wuku terliput oleh gt_day.json")
    return [list(next(iter(per[w]))) for w in range(30)]


# ---------------------------------------------------------------------- arti

# Nama komponen di halaman artihari.php vs nama field di mesin ini.
ARTI_KUNCI = {"Ekawara": "ekawara", "Dwiwara": "dwiwara", "Triwara": "triwara",
              "Caturwara": "caturwara", "Pancawara": "pancawara", "Sadwara": "sadwara",
              "Saptwara": "saptawara", "Astawara": "astawara", "Sangawara": "sangawara",
              "Dasawara": "dasawara", "Wuku": "wuku", "Lintang": "lintang",
              "Tanggal": "tanggal", "Ekajalaresi": "ekajalaresi", "Pararasan": "pararasan",
              "Pancasuda": "pancasuda", "Pratiti": "pratiti"}


def bangun_arti():
    """Teks tafsir naratif per nilai wewaran, dipanen dari artihari.php."""
    mentah = muat("arti_wara.json")
    out = {ARTI_KUNCI[k]: v for k, v in mentah.items() if k in ARTI_KUNCI}
    tulis("arti.js", out)
    print(f"  ({sum(len(v) for v in out.values())} tafsir di {len(out)} komponen)")


def bangun_tabel():
    tab = muat("tables.json")
    tab["pratiti"] = muat("pratiti.json")
    tab.pop("wuku", None)
    tab.pop("jejepan", None)
    tab["wewukon"] = bangun_wewukon(muat("gt_day.json"))
    # Dauh ayu hanya bergantung saptawara (diuji 120 hari lintas musim & era).
    tab["dauhAyu"] = muat("dauh_ayu.json")
    tulis("tabel.js", tab)
    print(f"  ({sum(len(x) for x in tab['wewukon'])} label wewukon di 30 wuku)")


if __name__ == "__main__":
    print("Membangun lib/bali-calendar/data/ dari fixtures ...")
    bangun_tabel()
    bangun_sasih()
    bangun_dewasa()
    bangun_rerainan()
    bangun_arti()
    print("Selesai. Jalankan: node scripts/bali-calendar/validate.mjs")
