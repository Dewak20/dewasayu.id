import Link from "next/link";

const modules = [
  { icon: "◉", title: "Anggaran", text: "Sumber dana, 17 alokasi kategori, transaksi DP hingga pelunasan.", stat: "17 kategori" },
  { icon: "✓", title: "Checklist", text: "Susun pekerjaan, tenggat, vendor, dan progres persiapan bersama.", stat: "38 tugas awal" },
  { icon: "♢", title: "Vendor MUA", text: "Bandingkan paket, harga owner dan team, cakupan, serta kontak vendor.", stat: "21 vendor" },
  { icon: "◎", title: "Prewedding", text: "Jelajahi kandidat tempat, bandingkan biaya, lalu buat shortlist pilihan.", stat: "66 lokasi" },
  { icon: "♡", title: "Daftar Tamu", text: "Pisahkan undangan kedua mempelai dan orang tua, lengkap dengan RSVP.", stat: "4 kelompok" },
  { icon: "□", title: "Seserahan", text: "Pastikan setiap box, isi, vendor, harga, dan status pembelian tercatat.", stat: "Per box" },
  { icon: "▤", title: "Dokumen", text: "Simpan seluruh persyaratan administrasi, catatan, dan tautan penting.", stat: "14 dokumen" },
  { icon: "✦", title: "Mood Board", text: "Satukan arahan warna, busana, cincin, lokasi, pose, dan referensi visual.", stat: "46 catatan" }
];

const financeRows = [
  ["Cincin", "Rp 20.000.000", 61], ["Hari H & Resepsi", "Rp 10.000.000", 39],
  ["MUA Ngidih", "Rp 3.000.000", 28]
];

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link className="landing-logo" href="/"><span className="landing-logo-mark">DA</span><span><strong>Dewasa Ayu</strong><small>Wedding Planner</small></span></Link>
          <nav aria-label="Navigasi landing page"><a href="#fitur">Fitur</a><a href="#cara-kerja">Cara kerja</a><a href="#tentang">Tentang</a></nav>
          <div className="landing-auth-actions"><Link className="nav-login" href="/login">Masuk</Link><Link className="nav-cta" href="/daftar">Daftar <span>→</span></Link></div>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="hero-botanical hero-botanical-left">❧</div><div className="hero-botanical hero-botanical-right">❧</div>
          <div className="landing-container hero-grid">
            <div className="hero-copy">
              <span className="landing-badge"><i>✦</i> Dibangun dari rencana yang benar-benar dipakai</span>
              <h1>Persiapan hari bahagia,<br/><em>tanpa yang terlupa.</em></h1>
              <p>Dari anggaran, vendor, dan checklist hingga tamu, seserahan, dan dokumen—semua persiapan pernikahan kalian rapi di satu tempat.</p>
              <div className="hero-actions"><Link className="landing-primary" href="/daftar">Mulai merencanakan <span>→</span></Link><a className="landing-secondary" href="#fitur">Lihat semua fitur</a></div>
              <div className="hero-trust"><span>✓ Tersimpan otomatis</span><span>✓ Siap dari ponsel</span><span>✓ Data dapat diperbarui</span></div>
            </div>
            <div className="hero-product" aria-label="Pratinjau aplikasi Dewasa Ayu">
              <div className="hero-halo"/>
              <div className="browser-mockup">
                <div className="browser-bar"><i/><i/><i/><span>dewasa-ayu.vercel.app/planner</span></div>
                <div className="browser-body">
                  <aside><div className="mock-logo">DA</div>{["⌂","◉","↗","✓","♢","♡"].map((icon,index)=><span className={index===0?"active":""} key={icon}>{icon}</span>)}</aside>
                  <div className="mock-content"><small>WEDDING DASHBOARD</small><h3>Om Swastyastu, Ayu</h3><div className="mock-event"><span>HARI H & RESEPSI</span><strong>5 Juni 2028</strong><em>651 hari lagi</em></div><div className="mock-metrics"><div><span>Total Anggaran</span><strong>Rp 33 jt</strong></div><div><span>Pengeluaran</span><strong>Rp 32 jt</strong></div><div><span>Checklist</span><strong>0/38</strong></div></div><div className="mock-list"><strong>Persiapan Terbaru</strong>{["Cari Vendor Prewedding","Beli cincin nikah","Booking MUA Ngidih"].map((item,index)=><p key={item}><i className={index===1?"checked":""}>{index===1?"✓":""}</i>{item}<small>{index===1?"Selesai":"Belum"}</small></p>)}</div></div>
                </div>
              </div>
              <div className="floating-note"><span>❧</span><div><small>SEMUA TERCATAT</small><strong>Tenang sampai hari-H</strong></div></div>
            </div>
          </div>
        </section>

        <section className="landing-strip" aria-label="Ringkasan data"><div className="landing-container strip-grid"><div><strong>17</strong><span>Kategori Anggaran</span></div><i/><div><strong>38</strong><span>Checklist Persiapan</span></div><i/><div><strong>21</strong><span>Vendor MUA</span></div><i/><div><strong>66</strong><span>Lokasi Prewedding</span></div></div></section>

        <section className="landing-section problem-section" id="tentang">
          <div className="landing-container">
            <div className="section-heading centered"><span className="section-label">SATU RUANG KERJA</span><h2>Persiapan pernikahan punya banyak bagian.<br/><em>Ketenangan datang saat semuanya terhubung.</em></h2><p>Tidak perlu berpindah antara Excel, notes, chat, dan galeri. Dewasa Ayu menjaga semua keputusan tetap dekat dan mudah ditemukan.</p></div>
            <div className="problem-grid"><article><span>01</span><div className="problem-icon">⌁</div><h3>Keuangan tercecer</h3><p>DP vendor, pelunasan, sumber dana, dan alokasi sering tercatat di tempat berbeda.</p></article><article><span>02</span><div className="problem-icon">⌛</div><h3>Waktu terus berjalan</h3><p>Pekerjaan kecil mudah terlupa saat tidak memiliki penanggung jawab dan tenggat.</p></article><article><span>03</span><div className="problem-icon">♧</div><h3>Keputusan menumpuk</h3><p>Vendor, tamu, dokumen, dan referensi visual perlu dibahas berulang bersama keluarga.</p></article></div>
          </div>
        </section>

        <section className="showcase-section" id="cara-kerja">
          <div className="showcase-ornament">❧</div>
          <div className="landing-container">
            <div className="section-heading light"><span className="section-label">DIGUNAKAN SETIAP HARI</span><h2>Yang rumit menjadi<br/><em>lebih mudah dibicarakan.</em></h2><p>Ringkasan yang jernih membantu kalian melihat keadaan, menentukan prioritas, lalu melangkah bersama.</p></div>
            <div className="showcase-grid">
              <article className="showcase-card finance-showcase"><div className="showcase-copy"><span>KEUANGAN</span><h3>Anggaran tidak lagi sekadar angka.</h3><p>Lihat alokasi, realisasi, dan selisih tiap kategori tanpa menghitung rumus secara manual.</p></div><div className="mini-screen"><header><span>Alokasi Anggaran</span><strong>Rp 33.000.000</strong></header>{financeRows.map(([name,value,width])=><div className="finance-row" key={name}><label><span>{name}</span><strong>{value}</strong></label><div><i style={{width:`${width}%`}}/></div></div>)}</div></article>
              <article className="showcase-card checklist-showcase"><div className="showcase-copy"><span>CHECKLIST</span><h3>Tahu apa yang harus dilakukan berikutnya.</h3><p>Status, vendor, tenggat, dan catatan berada di daftar yang sama.</p></div><div className="mini-screen task-screen"><div className="screen-title"><strong>Checklist</strong><span>8% selesai</span></div>{[["Pertemuan Keluarga",false],["Beli cincin nikah",true],["Booking MUA Resepsi",false],["Persiapan Administrasi",false]].map(([task,done])=><div className={done?"done":""} key={task}><i>{done?"✓":""}</i><span>{task}</span><small>{done?"DONE":"BELUM"}</small></div>)}</div></article>
              <article className="showcase-card guests-showcase"><div className="showcase-copy"><span>TAMU & KELUARGA</span><h3>Undangan dari empat pihak, tetap satu daftar.</h3><p>Atur pemilik undangan, prioritas, jumlah orang, dan RSVP tanpa duplikasi.</p></div><div className="guest-orbit"><div><strong>4</strong><span>kelompok</span></div>{["Pria","Ortu Pria","Wanita","Ortu Wanita"].map((name,index)=><span className={`orbit-${index+1}`} key={name}>{name}</span>)}</div></article>
            </div>
          </div>
        </section>

        <section className="landing-section modules-section" id="fitur">
          <div className="landing-container">
            <div className="section-heading split"><div><span className="section-label">SEMUA MODUL</span><h2>Satu perjalanan,<br/><em>satu tempat untuk semuanya.</em></h2></div><p>Struktur awalnya lahir dari workbook persiapan yang nyata, kemudian dibuat lebih mudah digunakan dan dikembangkan.</p></div>
            <div className="module-grid">{modules.map((module,index)=><article key={module.title} className={index===0?"featured":""}><div className="module-top"><span>{module.icon}</span><em>{module.stat}</em></div><h3>{module.title}</h3><p>{module.text}</p><Link href="/planner">Buka modul <span>→</span></Link></article>)}</div>
          </div>
        </section>

        <section className="comparison-section">
          <div className="landing-container comparison-grid">
            <div className="section-heading light"><span className="section-label">DARI WORKBOOK KE WORKSPACE</span><h2>Data yang sama.<br/><em>Pengalaman yang berbeda.</em></h2><p>Kekuatan perencanaan Excel tetap dipertahankan, kemudian disajikan sebagai aplikasi yang nyaman dibuka dari mana saja.</p><Link className="text-cta" href="/planner">Lihat planner langsung →</Link></div>
            <div className="comparison-cards"><article className="before"><span>SEBELUM</span><h3>File dan catatan terpisah</h3><ul><li>Rumus mudah terlewat</li><li>Sulit digunakan dari ponsel</li><li>Referensi tersebar di banyak sheet</li><li>Progres tidak langsung terlihat</li></ul></article><article className="after"><span>SEKARANG</span><h3>Satu workspace yang hidup</h3><ul><li>Perhitungan otomatis dan konsisten</li><li>Responsif untuk ponsel dan desktop</li><li>Seluruh modul saling terhubung</li><li>Tersimpan otomatis setiap perubahan</li></ul></article></div>
          </div>
        </section>

        <section className="landing-section closing-section">
          <div className="closing-leaf left">❧</div><div className="closing-leaf right">❧</div>
          <div className="landing-container"><span className="section-label">MULAI DARI YANG SUDAH ADA</span><h2>Rencana yang tenang,<br/><em>untuk hari yang dikenang.</em></h2><p>Semua data awal sudah siap. Tinggal lanjutkan persiapan kalian, satu keputusan pada satu waktu.</p><Link className="landing-primary" href="/daftar">Buat ruang kalian <span>→</span></Link></div>
        </section>
      </main>

      <footer className="landing-footer"><div className="landing-container footer-grid"><div><Link className="landing-logo footer-logo" href="/"><span className="landing-logo-mark">DA</span><span><strong>Dewasa Ayu</strong><small>Wedding Planner</small></span></Link><p>Ruang persiapan pernikahan yang tumbuh dari rencana nyata—rapi, hangat, dan selalu dekat.</p></div><div><strong>Navigasi</strong><a href="#fitur">Fitur</a><a href="#cara-kerja">Cara kerja</a><Link href="/planner">Planner</Link></div><div><strong>Modul</strong><Link href="/planner">Anggaran</Link><Link href="/planner">Checklist</Link><Link href="/planner">Daftar tamu</Link></div><div className="footer-note"><span>AYU & DEWA</span><p>Made with intention<br/>for a beautiful beginning.</p></div></div><div className="landing-container footer-bottom"><span>© 2026 Dewasa Ayu</span><span>Persiapan hari bahagia, tanpa yang terlupa.</span></div></footer>
    </div>
  );
}
