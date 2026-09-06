import Link from "next/link";
import LandingEffects from "./LandingEffects";
import LandingNav from "./LandingNav";
import {
  Rays, Rings, Sprig, Wave, Leaf, Frangipani,
  IconWallet, IconCheck, IconCompare, IconPin, IconHeart, IconBox, IconDocument,
  IconSparkle, IconFlow, IconHourglass, IconStack, IconCalendar, IconClock
} from "./LandingDoodles";

const modules = [
  { icon: IconWallet, title: "Anggaran", text: "Sumber dana, 17 alokasi kategori, dan transaksi dari DP hingga pelunasan.", stat: "17 kategori", tone: "gold", span: "wide" },
  { icon: IconCheck, title: "Checklist", text: "Susun pekerjaan, tenggat, vendor, dan progres persiapan bersama.", stat: "38 tugas", tone: "ink" },
  { icon: IconCompare, title: "Vendor MUA", text: "Bandingkan paket, harga owner dan team, cakupan, serta kontak.", stat: "21 vendor", tone: "paper" },
  { icon: IconPin, title: "Prewedding", text: "Jelajahi kandidat tempat, bandingkan biaya, lalu buat shortlist.", stat: "66 lokasi", tone: "cream" },
  { icon: IconHeart, title: "Daftar Tamu", text: "Pisahkan undangan kedua mempelai dan orang tua, lengkap dengan RSVP.", stat: "4 kelompok", tone: "paper" },
  { icon: IconBox, title: "Seserahan", text: "Pastikan setiap box, isi, vendor, harga, dan status pembelian tercatat.", stat: "Per box", tone: "cream" },
  { icon: IconDocument, title: "Dokumen", text: "Simpan seluruh persyaratan administrasi, catatan, dan tautan penting.", stat: "14 dokumen", tone: "paper" },
  { icon: IconSparkle, title: "Mood Board", text: "Satukan arahan warna, busana, cincin, lokasi, pose, dan referensi visual dalam satu papan.", stat: "46 catatan", tone: "ink", span: "full" }
];

const financeRows = [
  ["Cincin", "Rp 20.000.000", 61],
  ["Hari H & Resepsi", "Rp 10.000.000", 39],
  ["MUA Ngidih", "Rp 3.000.000", 28]
];

const stats = [
  [17, "Kategori anggaran"], [38, "Checklist persiapan"],
  [21, "Vendor MUA"], [66, "Lokasi prewedding"]
];

const problems = [
  { n: "01", icon: IconFlow, title: "Keuangan tercecer", text: "DP vendor, pelunasan, sumber dana, dan alokasi sering tercatat di tempat berbeda.", tone: "paper" },
  { n: "02", icon: IconHourglass, title: "Waktu terus berjalan", text: "Pekerjaan kecil mudah terlupa saat tidak memiliki penanggung jawab dan tenggat.", tone: "gold" },
  { n: "03", icon: IconStack, title: "Keputusan menumpuk", text: "Vendor, tamu, dokumen, dan referensi visual perlu dibahas berulang bersama keluarga.", tone: "ink" }
];

/* Modul adat memakai istilah yang benar-benar ada di planner
   (lihat ADAT_TYPES dan NAV pada PlannerApp) — jangan tambah istilah
   upacara baru tanpa rujukan yang jelas. */
const adat = [
  {
    icon: Frangipani,
    title: "Uang Adat & kas tunai",
    text: "Sesari pemangku, dana punia, peturunan banjar, tip kru, sampai uang saku panitia—tercatat lengkap dengan status sudah atau belum diserahkan.",
    tone: "gold"
  },
  {
    icon: IconCalendar,
    title: "Rangkaian acara & rundown",
    text: "Setiap acara punya tanggal, lokasi, susunan waktu, dan penanggung jawab sendiri. Bukan satu hari-H, tapi seluruh rangkaian.",
    tone: "paper"
  },
  {
    icon: IconBox,
    title: "Seserahan & katering",
    text: "Isi tiap box, vendor, harga, status pembelian, serta kebutuhan katering dan logistik untuk keluarga yang datang membantu.",
    tone: "paper"
  }
];

/* CONTOH TESTIMONI — WAJIB DIGANTI kutipan asli sebelum tayang.
   Jangan publikasikan teks di bawah ini seolah ulasan sungguhan. */
const testimonials = [
  { quote: "Bagian uang adat yang paling menolong. Sebelumnya sesari dan dana punia selalu jadi catatan terpisah di buku tulis.", name: "Nama pasangan", role: "Kota / tanggal acara" },
  { quote: "Rangkaian acaranya banyak, dan baru terasa terkendali setelah semuanya punya rundown dan penanggung jawab.", name: "Nama pasangan", role: "Kota / tanggal acara" },
  { quote: "Orang tua bisa ikut melihat daftar tamunya masing-masing tanpa harus saling kirim file.", name: "Nama pasangan", role: "Kota / tanggal acara" }
];

export default function LandingPage() {
  return (
    <div className="landing">
      <LandingEffects />
      <div className="scroll-progress" aria-hidden="true"><i /></div>

      <LandingNav />

      <main className="stack">
        {/* ---------------- HERO ---------------- */}
        <section className="panel hero-panel">
          <div className="hero-copy">
            <span className="eyebrow" data-reveal><i aria-hidden="true">✦</i> Dibuat untuk pernikahan adat Bali</span>
            <h1 data-reveal style={{ "--d": "70ms" }}>
              Seluruh rangkaian, <span className="mark">tanpa yang terlupa.</span>
            </h1>
            <p data-reveal style={{ "--d": "150ms" }}>
              Dari sesari pemangku dan peturunan banjar sampai anggaran, vendor, dan daftar tamu
              empat pihak—setiap keputusan pernikahan kalian rapi di satu ruang kerja yang tenang.
            </p>
            <div className="actions" data-reveal style={{ "--d": "230ms" }}>
              <Link className="btn btn-gold btn-lg" href="/daftar">Mulai merencanakan <i className="arrow" aria-hidden="true">↗</i></Link>
              <a className="btn btn-outline btn-lg" href="#fitur">Lihat semua fitur</a>
            </div>
            <ul className="trust" data-reveal style={{ "--d": "310ms" }}>
              <li>Tersimpan otomatis</li><li>Siap dari ponsel</li><li>Data dapat diperbarui</li>
            </ul>
          </div>

          <div className="hero-art" data-reveal style={{ "--d": "180ms" }}>
            <Rays className="doodle doodle-rays" />
            <Sprig className="doodle doodle-sprig" />

            {/* Ganti berkas di bawah dengan foto pasangan (rasio 1:1, minimal 800×800).
                Placeholder SVG dipakai supaya slot ini tetap layak tayang bila foto belum ada. */}
            <figure className="hero-photo">
              <img src="/hero/couple-placeholder.svg" alt="" width="800" height="800" />
            </figure>
            <Wave className="doodle doodle-wave" />

            <div className="mock" aria-label="Pratinjau aplikasi Dewasa Ayu">
              <div className="mock-bar"><i /><i /><i /><span>dewasa-ayu.app/planner</span></div>
              <div className="mock-main">
                <small>WEDDING DASHBOARD</small>
                <h3>Om Swastyastu, Ayu</h3>
                <div className="mock-hero">
                  <span>HARI H &amp; RESEPSI</span><strong>5 Juni 2028</strong><em>651 hari lagi</em>
                </div>
                <div className="mock-stats">
                  <div><span>Anggaran</span><strong>Rp 33 jt</strong></div>
                  <div><span>Terpakai</span><strong>Rp 32 jt</strong></div>
                  <div><span>Checklist</span><strong>12/38</strong></div>
                </div>
              </div>
            </div>

            <div className="chip-note"><span aria-hidden="true"><Frangipani /></span><div><small>UANG ADAT</small><strong>7 sesari tercatat</strong></div></div>
          </div>
        </section>

        {/* ---------------- STATS ---------------- */}
        <section className="stat-bar" aria-label="Ringkasan data">
          {stats.map(([value, label], i) => (
            <div key={label} data-reveal style={{ "--d": `${i * 80}ms` }}>
              <strong><span data-count={value}>{value}</span><i>+</i></strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        {/* ---------------- MASALAH ---------------- */}
        <section className="panel" id="tentang">
          <div className="split-head">
            <div data-reveal>
              <span className="eyebrow"><i aria-hidden="true">✦</i> Satu ruang kerja</span>
              <h2>Persiapan pernikahan punya banyak bagian. Ketenangan datang saat semuanya terhubung.</h2>
            </div>
            <p data-reveal style={{ "--d": "120ms" }}>
              Tidak perlu berpindah antara Excel, catatan, chat, dan galeri. Dewasa Ayu menjaga
              semua keputusan tetap dekat dan mudah ditemukan.
            </p>
          </div>
          <div className="tri-grid">
            {problems.map((item, i) => (
              <article key={item.n} className={`tile tone-${item.tone}`} data-reveal data-spotlight style={{ "--d": `${i * 110}ms` }}>
                <div className="tile-top"><span className="tile-icon" aria-hidden="true"><item.icon /></span><em>{item.n}</em></div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <Sprig className="tile-doodle" />
              </article>
            ))}
          </div>
        </section>

        {/* ---------------- MODUL (BENTO) ---------------- */}
        <section className="panel" id="fitur">
          <div className="split-head">
            <div data-reveal>
              <span className="eyebrow"><i aria-hidden="true">✦</i> Semua modul</span>
              <h2>Satu perjalanan, satu tempat untuk semuanya.</h2>
            </div>
            <p data-reveal style={{ "--d": "120ms" }}>
              Strukturnya lahir dari workbook persiapan yang nyata, kemudian dibuat lebih mudah
              digunakan dan terus dikembangkan.
            </p>
          </div>
          <div className="bento">
            {modules.map((m, i) => (
              <article
                key={m.title}
                className={`tile tone-${m.tone}${m.span ? ` span-${m.span}` : ""}`}
                data-reveal data-spotlight style={{ "--d": `${(i % 4) * 80}ms` }}
              >
                <div className="tile-top"><span className="tile-icon" aria-hidden="true"><m.icon /></span><em>{m.stat}</em></div>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
                <Link className="circle-link" href="/planner">
                  <i className="arrow" aria-hidden="true">↗</i> Buka modul
                </Link>
                {m.tone === "gold" ? <Rings className="tile-doodle" /> : <Sprig className="tile-doodle" />}
              </article>
            ))}
          </div>
        </section>

        {/* ---------------- ADAT BALI ---------------- */}
        <section className="panel adat-panel" id="adat">
          <Sprig className="adat-doodle" />
          <div className="split-head on-dark">
            <div data-reveal>
              <span className="eyebrow"><i aria-hidden="true">✦</i> Yang tidak ada di planner lain</span>
              <h2>Pernikahan Bali bukan <span className="mark">satu hari.</span></h2>
            </div>
            <p data-reveal style={{ "--d": "120ms" }}>
              Ada rangkaian upacara, ada kewajiban ke banjar, ada kas tunai yang tidak pernah
              muncul di template anggaran biasa. Semuanya sudah punya tempat di sini.
            </p>
          </div>
          <div className="tri-grid">
            {adat.map((item, i) => (
              <article key={item.title} className={`tile tone-${item.tone}`} data-reveal data-spotlight style={{ "--d": `${i * 110}ms` }}>
                <div className="tile-top">
                  <span className="tile-icon" aria-hidden="true"><item.icon /></span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                {item.tone === "gold" && <Sprig className="tile-doodle" />}
              </article>
            ))}
          </div>
          <p className="adat-note" data-reveal>
            <span aria-hidden="true"><IconClock /></span>
            Kalkulator dewasa ayu (perhitungan hari baik) sedang disiapkan bersama rujukan wariga—
            belum tersedia, dan tidak akan kami tebak-tebak.
          </p>
        </section>

        {/* ---------------- CARA KERJA ---------------- */}
        <section className="showcase" id="cara-kerja">
          <div className="split-head on-dark">
            <div data-reveal>
              <span className="eyebrow"><i aria-hidden="true">✦</i> Digunakan setiap hari</span>
              <h2>Yang rumit menjadi lebih mudah dibicarakan.</h2>
            </div>
            <p data-reveal style={{ "--d": "120ms" }}>
              Ringkasan yang jernih membantu kalian melihat keadaan, menentukan prioritas,
              lalu melangkah bersama.
            </p>
          </div>

          <div className="show-grid">
            <article className="show-card wide" data-reveal data-spotlight>
              <div className="show-copy">
                <span className="tag">Keuangan</span>
                <h3>Anggaran tidak lagi sekadar angka.</h3>
                <p>Lihat alokasi, realisasi, dan selisih tiap kategori tanpa menghitung rumus manual.</p>
              </div>
              <div className="screen">
                <header><span>Alokasi anggaran</span><strong>Rp 33.000.000</strong></header>
                {financeRows.map(([name, value, width]) => (
                  <div className="bar-row" key={name}>
                    <label><span>{name}</span><strong>{value}</strong></label>
                    <div><i style={{ width: `${width}%` }} /></div>
                  </div>
                ))}
              </div>
            </article>

            <article className="show-card" data-reveal data-spotlight style={{ "--d": "110ms" }}>
              <div className="show-copy">
                <span className="tag">Checklist</span>
                <h3>Tahu apa yang harus dilakukan berikutnya.</h3>
                <p>Status, vendor, tenggat, dan catatan berada di daftar yang sama.</p>
              </div>
              <div className="screen task-screen">
                <div className="screen-title"><strong>Checklist</strong><span>32% selesai</span></div>
                {[["Pertemuan keluarga", true], ["Beli cincin nikah", true], ["Booking MUA resepsi", false], ["Persiapan administrasi", false]].map(([task, done]) => (
                  <div className={done ? "done" : ""} key={task}><i>{done ? "✓" : ""}</i><span>{task}</span><small>{done ? "DONE" : "BELUM"}</small></div>
                ))}
              </div>
            </article>

            <article className="show-card" data-reveal data-spotlight style={{ "--d": "200ms" }}>
              <div className="show-copy">
                <span className="tag">Tamu &amp; keluarga</span>
                <h3>Undangan dari empat pihak, tetap satu daftar.</h3>
                <p>Atur pemilik undangan, prioritas, jumlah orang, dan RSVP tanpa duplikasi.</p>
              </div>
              <div className="orbit">
                <div><strong>4</strong><span>kelompok</span></div>
                {["Pria", "Ortu Pria", "Wanita", "Ortu Wanita"].map((name, i) => (
                  <span className={`orbit-${i + 1}`} key={name}>{name}</span>
                ))}
              </div>
            </article>
          </div>
        </section>

        {/* ---------------- TESTIMONI ----------------
             Data placeholder; ganti dengan kutipan asli sebelum tayang. */}
        <section className="panel">
          <div className="split-head">
            <div data-reveal>
              <span className="eyebrow"><i aria-hidden="true">✦</i> Kata pasangan</span>
              <h2>Yang paling sering mereka sebut.</h2>
            </div>
            <p data-reveal style={{ "--d": "120ms" }}>
              Cerita dari pasangan yang memakai Dewasa Ayu untuk menyiapkan rangkaian acaranya.
            </p>
          </div>
          <div className="tri-grid">
            {testimonials.map((item, i) => (
              <figure key={item.quote} className="testi-card" data-reveal data-spotlight style={{ "--d": `${i * 110}ms` }}>
                <span className="testi-mark" aria-hidden="true">”</span>
                <blockquote>{item.quote}</blockquote>
                <figcaption>
                  <span className="testi-avatar" aria-hidden="true"><Leaf /></span>
                  <span><strong>{item.name}</strong><small>{item.role}</small></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ---------------- PERBANDINGAN ---------------- */}
        <section className="panel">
          <div className="split-head">
            <div data-reveal>
              <span className="eyebrow"><i aria-hidden="true">✦</i> Dari workbook ke workspace</span>
              <h2>Data yang sama, pengalaman yang berbeda.</h2>
            </div>
            <p data-reveal style={{ "--d": "120ms" }}>
              Kekuatan perencanaan Excel tetap dipertahankan, lalu disajikan sebagai aplikasi
              yang nyaman dibuka dari mana saja.
            </p>
          </div>
          <div className="compare">
            <article className="tile tone-ink" data-reveal>
              <span className="tag">Sebelum</span>
              <h3>File dan catatan terpisah</h3>
              <ul className="list-x">
                <li>Rumus mudah terlewat</li><li>Sulit digunakan dari ponsel</li>
                <li>Referensi tersebar di banyak sheet</li><li>Progres tidak langsung terlihat</li>
              </ul>
            </article>
            <article className="tile tone-gold" data-reveal data-spotlight style={{ "--d": "120ms" }}>
              <span className="tag">Sekarang</span>
              <h3>Satu workspace yang hidup</h3>
              <ul className="list-check">
                <li>Perhitungan otomatis dan konsisten</li><li>Responsif untuk ponsel dan desktop</li>
                <li>Seluruh modul saling terhubung</li><li>Tersimpan otomatis setiap perubahan</li>
              </ul>
              <Rings className="tile-doodle" />
            </article>
          </div>
        </section>

        {/* ---------------- PENUTUP ---------------- */}
        <section className="panel cta-panel" data-reveal>
          <Sprig className="cta-doodle left" />
          <Sprig className="cta-doodle right" />
          <span className="eyebrow"><i aria-hidden="true">✦</i> Mulai dari yang sudah ada</span>
          <h2>Rencana yang tenang, untuk hari yang dikenang.</h2>
          <p>Semua data awal sudah siap. Tinggal lanjutkan persiapan kalian, satu keputusan pada satu waktu.</p>
          <Link className="btn btn-ink btn-lg" href="/daftar">Buat ruang kalian <i className="arrow" aria-hidden="true">↗</i></Link>
        </section>
      </main>

      <footer className="foot">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link className="brand" href="/">
              <span className="brand-mark"><Leaf /></span>
              <span className="brand-name"><strong>Dewasa Ayu</strong><small>Wedding Planner</small></span>
            </Link>
            <p>Ruang persiapan pernikahan yang tumbuh dari rencana nyata—rapi, hangat, dan selalu dekat.</p>
          </div>
          <div><strong>Navigasi</strong><a href="#tentang">Tentang</a><a href="#adat">Adat Bali</a><a href="#fitur">Fitur</a><a href="#cara-kerja">Cara kerja</a></div>
          <div><strong>Modul</strong><Link href="/planner">Anggaran</Link><Link href="/planner">Checklist</Link><Link href="/planner">Daftar tamu</Link></div>
          <div><strong>Mulai</strong><Link href="/daftar">Daftar</Link><Link href="/login">Masuk</Link><Link href="/planner">Planner</Link></div>
        </div>
        <div className="wordmark" aria-hidden="true">Dewasa Ayu</div>
        <div className="foot-bottom">
          <span>© 2026 Dewasa Ayu</span>
          <span>Persiapan hari bahagia, tanpa yang terlupa.</span>
        </div>
      </footer>
    </div>
  );
}
