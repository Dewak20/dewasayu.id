"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

// Korpus 220 aturan ala-ayuning dewasa ~200 kB dan hanya dipakai kartu acara.
// Dimuat terpisah supaya tidak ikut bundel awal planner.
const CatatanDewasa = dynamic(() => import("./CatatanDewasa"), { ssr: false });
import initialData from "../data/wedding-data.json";

const STORE_KEY = "dewasa-ayu-planner-v2";
const NAV = [
  ["dashboard", "⌂", "Ringkasan"], ["finance", "∑", "Keuangan"],
  ["budget", "◉", "Anggaran"], ["expenses", "↗", "Pengeluaran"],
  ["payments", "⊟", "Bayar Vendor"], ["funding", "⊕", "Pendanaan"],
  ["adat", "❋", "Uang Adat"], ["saving", "◌", "Tabungan"],
  ["events", "◈", "Rangkaian Acara"], ["rundown", "◷", "Rundown & PIC"],
  ["katering", "❖", "Katering"], ["transportasi", "⇄", "Transport & Akomodasi"],
  ["emergency", "✚", "Emergency Kit"], ["checklist", "✓", "Checklist"],
  ["vendors", "♢", "Vendor MUA"], ["vendor-compare", "⚖", "Banding Vendor"],
  ["prewedding", "◎", "Prewedding"], ["shotlist", "▦", "Shot List"],
  ["guests", "♡", "Daftar Tamu"], ["preparations", "□", "Seserahan"],
  ["documents", "▤", "Dokumen"], ["pascanikah", "⊛", "Pasca-Nikah"],
  ["playlist", "♪", "Playlist"], ["catatan", "✎", "Catatan"],
  ["moodboard", "✦", "Mood Board"]
];
const OWNER_OPTIONS = ["Pengantin Pria", "Orang Tua Pria", "Pengantin Wanita", "Orang Tua Wanita"];
const money = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value || 0));
const shortMoney = (value) => value >= 1e9 ? `Rp ${(value / 1e9).toFixed(1)} M` : value >= 1e6 ? `Rp ${(value / 1e6).toFixed(1)} jt` : money(value);
const prettyDate = (value) => value ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : "Belum diatur";
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const clone = (value) => JSON.parse(JSON.stringify(value));

export default function PlannerApp() {
  const [data, setData] = useState(() => clone(initialData));
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("dashboard");
  const [sidebar, setSidebar] = useState(false);
  const [toast, setToast] = useState("");
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY));
      if (saved?.meta && saved?.project) setData(saved);
    } catch (_) {}
    setReady(true);
  }, []);
  // Penulisan harus dijaga: di Safari mode penyamaran dan saat kuota penuh,
  // setItem melempar error. Tanpa penjagaan ini seluruh planner ikut mati.
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
      setStorageError("");
    } catch (error) {
      setStorageError(error?.name === "QuotaExceededError"
        ? "Penyimpanan browser penuh — perubahan terakhir belum tersimpan. Ekspor datamu, lalu hapus entri yang tidak terpakai."
        : "Browser menolak menyimpan data (mis. mode penyamaran). Perubahanmu hanya bertahan selama tab ini terbuka — segera ekspor datamu.");
    }
  }, [data, ready]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 2600); return () => clearTimeout(timer); }, [toast]);

  const patchData = (key, next) => setData((current) => ({ ...current, [key]: typeof next === "function" ? next(current[key]) : next }));
  const notify = (message) => setToast(message);
  const couple = data.project.couple || "Pasangan Bahagia";
  const nextEvent = [...data.project.events].filter((event) => event.date).sort((a, b) => a.date.localeCompare(b.date)).find((event) => new Date(event.date) >= new Date()) || data.project.events[0];
  const daysLeft = nextEvent?.date ? Math.max(0, Math.ceil((new Date(nextEvent.date) - new Date()) / 86400000)) : 0;

  const props = { data, patchData, notify };
  return (
    <div className="planner-shell">
      <aside className={`planner-sidebar ${sidebar ? "open" : ""}`}>
        <button className="planner-brand" onClick={() => setView("dashboard")}><span className="brand-mark">DA</span><span><strong>Dewasa Ayu</strong><small>Wedding Planner</small></span></button>
        <nav className="planner-nav">
          {NAV.map(([id, icon, label]) => <button key={id} className={view === id ? "active" : ""} onClick={() => { setView(id); setSidebar(false); }}><span>{icon}</span>{label}{id === "checklist" && <em>{data.checklist.filter((item) => !item.done).length}</em>}</button>)}
        </nav>
        <div className="side-countdown"><span>ACARA BERIKUTNYA</span><strong>{daysLeft} hari lagi</strong><small>{nextEvent?.name} · {prettyDate(nextEvent?.date)}</small></div>
        <div className="side-couple"><span>{couple.split("&").map((name) => name.trim()[0]).join("&")}</span><div><strong>{couple}</strong><small>Data dari Excel</small></div></div>
      </aside>
      {sidebar && <button className="sidebar-scrim" aria-label="Tutup menu" onClick={() => setSidebar(false)} />}

      <main className="planner-main">
        <header className="planner-topbar"><button className="mobile-menu" onClick={() => setSidebar(true)}>☰</button><div><span>WEDDING WORKSPACE</span><strong>{NAV.find(([id]) => id === view)?.[2]}</strong></div><div className="top-actions"><span className="save-state">● Tersimpan otomatis</span><button className="avatar-button">{couple.charAt(0)}</button></div></header>
        {storageError && <div className="storage-warning" role="alert"><strong>⚠ Data belum tersimpan.</strong> {storageError}</div>}
        <div className="planner-content">
          {view === "dashboard" && <DashboardView {...props} onNavigate={setView} />}
          {view === "budget" && <BudgetView {...props} />}
          {view === "expenses" && <ExpensesView {...props} />}
          {view === "adat" && <UangAdatView {...props} />}
          {view === "finance" && <RingkasanKeuanganView {...props} onNavigate={setView} />}
          {view === "payments" && <PaymentVendorView {...props} />}
          {view === "funding" && <PendanaanView {...props} />}
          {view === "saving" && <SavingPlannerView {...props} />}
          {view === "events" && <RangkaianAcaraView {...props} />}
          {view === "rundown" && <RundownView {...props} />}
          {view === "katering" && <KateringView {...props} />}
          {view === "transportasi" && <TransportasiView {...props} />}
          {view === "emergency" && <EmergencyKitView {...props} />}
          {view === "checklist" && <ChecklistView {...props} />}
          {view === "vendors" && <VendorView {...props} />}
          {view === "prewedding" && <PreweddingView {...props} />}
          {view === "guests" && <GuestsView {...props} />}
          {view === "preparations" && <PreparationsView {...props} />}
          {view === "documents" && <DocumentsView {...props} />}
          {view === "vendor-compare" && <VendorCompareView {...props} />}
          {view === "shotlist" && <ShotListView {...props} />}
          {view === "pascanikah" && <PascaNikahView {...props} />}
          {view === "playlist" && <PlaylistView {...props} />}
          {view === "catatan" && <CatatanView {...props} />}
          {view === "moodboard" && <MoodboardView {...props} />}
        </div>
      </main>
      <div className={`toast ${toast ? "show" : ""}`} role="status">{toast}</div>
    </div>
  );
}

function DashboardView({ data, onNavigate }) {
  const funding = sum(data.project.fundingSources, "amount");
  const allocation = sum(data.categories, "allocation");
  const spent = sum(data.expenses, "amount");
  const tasksDone = data.checklist.filter((item) => item.done).length;
  const pax = sum(data.guests, "pax");
  const suspicious = data.project.fundingSources.filter((item) => item.amount > 1000000000);
  const events = data.project.events;
  return <>
    <PageIntro kicker="PUSAT PERSIAPAN" title={`Selamat datang, ${data.project.couple}.`} text="Seluruh sistem dan data workbook kini berada dalam satu ruang kerja." />
    {suspicious.length > 0 && <div className="data-alert"><strong>⚠ Perlu diperiksa:</strong> sumber dana {suspicious.map((item) => `${item.name} (${money(item.amount)})`).join(", ")} terlihat jauh lebih besar dari data lainnya. Nilainya dipertahankan sesuai Excel.</div>}
    <div className="event-grid">{events.map((event) => <article className="event-card" key={event.id}><span>{event.name}</span><strong>{prettyDate(event.date)}</strong><em>{Math.max(0, Math.ceil((new Date(event.date) - new Date()) / 86400000))} hari lagi</em></article>)}</div>
    <div className="metric-grid">
      <Metric label="Total Sumber Dana" value={shortMoney(funding)} note={`${data.project.fundingSources.length} kontributor`} tone="green" />
      <Metric label="Alokasi Anggaran" value={shortMoney(allocation)} note={`${data.categories.length} kategori`} />
      <Metric label="Pengeluaran Aktual" value={shortMoney(spent)} note={`${data.expenses.length} transaksi`} />
      <Metric label="Total Undangan" value={`${pax} orang`} note={`${data.guests.length} entri tamu`} />
    </div>
    <div className="overview-grid">
      <section className="workspace-card"><CardHead kicker="PROGRES" title="Checklist Pernikahan" action={`${tasksDone}/${data.checklist.length}`} /><div className="big-progress"><span style={{ width: `${data.checklist.length ? tasksDone / data.checklist.length * 100 : 0}%` }} /></div><div className="task-preview">{data.checklist.slice(0, 6).map((task) => <div key={task.id}><span className={task.done ? "done-dot" : "todo-dot"}>{task.done ? "✓" : ""}</span><p>{task.task}</p><small>{task.dueDate ? prettyDate(task.dueDate) : "Belum ada tenggat"}</small></div>)}</div><button className="link-button" onClick={() => onNavigate("checklist")}>Kelola semua checklist →</button></section>
      <section className="workspace-card"><CardHead kicker="ANGGARAN" title="Alokasi Terbesar" action={money(allocation)} /><div className="budget-bars">{[...data.categories].sort((a,b) => b.allocation-a.allocation).slice(0,6).map((category) => <div key={category.id}><label><span>{category.name}</span><strong>{shortMoney(category.allocation)}</strong></label><div><i style={{ width: `${allocation ? category.allocation/allocation*100 : 0}%` }} /></div></div>)}</div><button className="link-button" onClick={() => onNavigate("budget")}>Buka detail anggaran →</button></section>
    </div>
    <div className="quick-modules">{[
      ["vendors", "♢", data.muaVendors.length, "Vendor MUA"], ["prewedding", "◎", data.preweddingLocations.length, "Lokasi prewedding"], ["documents", "▤", data.documents.length, "Dokumen"], ["moodboard", "✦", data.assets.length, "Aset visual"]
    ].map(([id, icon, count, label]) => <button key={id} onClick={() => onNavigate(id)}><span>{icon}</span><strong>{count}</strong><small>{label}</small></button>)}</div>
  </>;
}

function BudgetView({ data, patchData, notify }) {
  const funding = sum(data.project.fundingSources, "amount");
  const allocation = sum(data.categories, "allocation");
  const spentByCategory = Object.fromEntries(data.categories.map((category) => [category.name, data.expenses.filter((item) => item.category === category.name).reduce((total, item) => total + Number(item.amount), 0)]));
  const updateSource = (id, field, value) => patchData("project", { ...data.project, fundingSources: data.project.fundingSources.map((item) => item.id === id ? { ...item, [field]: field === "amount" ? Number(value) : value } : item) });
  const updateCategory = (id, value) => patchData("categories", data.categories.map((item) => item.id === id ? { ...item, allocation: Number(value) } : item));
  const updateEvent = (id, field, value) => patchData("project", { ...data.project, events: data.project.events.map((item) => item.id === id ? { ...item, [field]: value } : item) });
  return <><PageIntro kicker="PERENCANAAN KEUANGAN" title="Anggaran & sumber dana" text="Nilai dapat diedit langsung dan semua total dihitung ulang otomatis." />
    <div className="metric-grid"><Metric label="Total Sumber Dana" value={money(funding)} tone="green" /><Metric label="Total Alokasi" value={money(allocation)} /><Metric label="Aktual" value={money(sum(data.expenses,"amount"))} /><Metric label="Belum Dialokasikan" value={money(funding-allocation)} /></div>
    <div className="two-column">
      <section className="workspace-card"><CardHead kicker="PROYEK" title="Identitas & Tanggal Acara" /><label className="inline-form"><span>Nama pasangan</span><input defaultValue={data.project.couple} onBlur={(e) => { patchData("project", { ...data.project, couple:e.target.value }); notify("Nama pasangan diperbarui"); }} /></label>{data.project.events.map((event) => <div className="event-editor" key={event.id}><input value={event.name} onChange={(e)=>updateEvent(event.id,"name",e.target.value)} /><input type="date" value={event.date?.slice(0,10)||""} onChange={(e)=>updateEvent(event.id,"date",e.target.value)} /></div>)}</section>
      <section className="workspace-card"><CardHead kicker="KONTRIBUSI" title="Sumber Dana" action={money(funding)} />{data.project.fundingSources.map((source) => <div className={`money-row ${source.amount > 1e9 ? "warning" : ""}`} key={source.id}><input value={source.name} onChange={(e)=>updateSource(source.id,"name",e.target.value)} /><div><span>Rp</span><input type="number" value={source.amount} onChange={(e)=>updateSource(source.id,"amount",e.target.value)} /></div></div>)}</section>
    </div>
    <section className="workspace-card budget-table-card"><CardHead kicker={`${data.categories.length} KATEGORI ANGGARAN`} title="Alokasi dan Realisasi" action={money(allocation)} /><div className="data-table budget-table"><div className="table-head"><span>Kategori</span><span>Alokasi</span><span>Aktual</span><span>Selisih</span><span>Progres</span></div>{data.categories.map((category) => { const actual=spentByCategory[category.name]||0; const ratio=category.allocation?actual/category.allocation*100:actual?100:0; return <div className="table-row" key={category.id}><strong>{category.name}</strong><label className="money-cell">Rp <input type="number" value={category.allocation} onChange={(e)=>updateCategory(category.id,e.target.value)} /></label><span>{money(actual)}</span><span className={category.allocation-actual<0?"negative":"positive-text"}>{money(category.allocation-actual)}</span><div className="row-progress"><i style={{width:`${Math.min(ratio,100)}%`}} /><small>{Math.round(ratio)}%</small></div></div>})}</div></section>
  </>;
}

function ExpensesView({ data, patchData, notify }) {
  const empty = { name:"", date:new Date().toISOString().slice(0,10), category:data.categories[0]?.name||"Lainnya", paymentType:"DP", amount:"", note:"", vendor:"", status:"paid" };
  const [form,setForm]=useState(empty); const [modal,setModal]=useState(false); const [editing,setEditing]=useState(null); const [query,setQuery]=useState(""); const [filter,setFilter]=useState("all");
  const items=data.expenses.filter((item)=>(filter==="all"||item.category===filter)&&(!query||`${item.name} ${item.vendor} ${item.note}`.toLowerCase().includes(query.toLowerCase()))).sort((a,b)=>b.date.localeCompare(a.date));
  const open=(item)=>{setEditing(item?.id||null);setForm(item?{...item}:{...empty});setModal(true)};
  const save=(e)=>{e.preventDefault();const record={...form,id:editing||uid("expense"),amount:Number(form.amount)};patchData("expenses",editing?data.expenses.map((x)=>x.id===editing?record:x):[...data.expenses,record]);setModal(false);notify(editing?"Transaksi diperbarui":"Transaksi ditambahkan")};
  const remove=(id)=>{if(confirm("Hapus transaksi ini?")){patchData("expenses",data.expenses.filter((x)=>x.id!==id));notify("Transaksi dihapus")}};
  return <><PageIntro kicker="ARUS KELUAR" title="Pengeluaran" text="Catat DP, cicilan, pelunasan, vendor, serta kategori anggaran." action={<button className="main-button" onClick={()=>open()}>＋ Catat pengeluaran</button>} />
    <div className="metric-grid"><Metric label="Total Transaksi" value={money(sum(data.expenses,"amount"))} tone="green" /><Metric label="DP" value={money(sum(data.expenses.filter(x=>x.paymentType==="DP"),"amount"))} /><Metric label="Pelunasan" value={money(sum(data.expenses.filter(x=>x.paymentType==="Pelunasan"),"amount"))} /><Metric label="Jumlah Catatan" value={`${data.expenses.length} transaksi`} /></div>
    <section className="workspace-card"><div className="list-toolbar"><input placeholder="Cari pengeluaran..." value={query} onChange={(e)=>setQuery(e.target.value)} /><select value={filter} onChange={(e)=>setFilter(e.target.value)}><option value="all">Semua kategori</option>{data.categories.map(c=><option key={c.id}>{c.name}</option>)}</select></div><div className="record-list">{items.map(item=><article key={item.id}><span className="record-icon">↗</span><div><strong>{item.name}</strong><small>{item.vendor||"Tanpa vendor"} · {item.category} · {prettyDate(item.date)}</small></div><em className={`pill ${item.paymentType==="Pelunasan"?"paid":""}`}>{item.paymentType}</em><b>{money(item.amount)}</b><div className="row-actions"><button onClick={()=>open(item)}>Edit</button><button onClick={()=>remove(item.id)}>Hapus</button></div></article>)}</div></section>
    {modal&&<Modal title={editing?"Edit Pengeluaran":"Catat Pengeluaran"} onClose={()=>setModal(false)}><form onSubmit={save} className="editor-form"><Field label="Detail pengeluaran"><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field><Field label="Vendor"><input value={form.vendor} onChange={e=>setForm({...form,vendor:e.target.value})}/></Field><Field label="Tanggal"><input required type="date" value={form.date?.slice(0,10)} onChange={e=>setForm({...form,date:e.target.value})}/></Field><Field label="Kategori"><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{data.categories.map(c=><option key={c.id}>{c.name}</option>)}</select></Field><Field label="Jenis pembayaran"><select value={form.paymentType} onChange={e=>setForm({...form,paymentType:e.target.value})}><option>DP</option><option>Pembayaran</option><option>Cicilan</option><option>Pelunasan</option></select></Field><Field label="Nominal"><input required type="number" min="0" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></Field><Field wide label="Keterangan"><textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></Field><FormActions onCancel={()=>setModal(false)} /></form></Modal>}
  </>;
}

const ADAT_TYPES = ["Sesari pemangku", "Dana punia", "Peturunan banjar", "Tip kru", "Uang saku panitia", "Pelunasan tunai", "Lainnya"];
const ADAT_REFERENCE = [
  { type: "Sesari pemangku", recipient: "Pemangku muput upacara" },
  { type: "Dana punia", recipient: "Pura / Merajan" },
  { type: "Peturunan banjar", recipient: "Banjar adat" },
  { type: "Uang saku panitia", recipient: "Koordinator panitia" },
  { type: "Tip kru", recipient: "Kru dekorasi & katering" }
];

function UangAdatView({ data, patchData, notify }) {
  const adatFunds = data.adatFunds || [];
  const empty = { type: ADAT_TYPES[0], recipient: "", amount: "", delivered: false, note: "" };
  const [form, setForm] = useState(empty);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const total = sum(adatFunds, "amount");
  const delivered = sum(adatFunds.filter((x) => x.delivered), "amount");
  const pending = total - delivered;
  const items = adatFunds.filter((x) => (typeFilter === "all" || x.type === typeFilter) && (statusFilter === "all" || (statusFilter === "delivered" ? x.delivered : !x.delivered)));

  const open = (item) => { setEditing(item?.id || null); setForm(item ? { ...item } : { ...empty }); setModal(true); };
  const save = (e) => { e.preventDefault(); const record = { ...form, id: editing || uid("adat"), amount: Number(form.amount) }; patchData("adatFunds", editing ? adatFunds.map((x) => x.id === editing ? record : x) : [...adatFunds, record]); setModal(false); notify(editing ? "Pos uang adat diperbarui" : "Pos uang adat ditambahkan"); };
  const toggle = (id) => patchData("adatFunds", adatFunds.map((x) => x.id === id ? { ...x, delivered: !x.delivered } : x));
  const remove = (id) => { if (confirm("Hapus pos uang adat ini?")) { patchData("adatFunds", adatFunds.filter((x) => x.id !== id)); notify("Pos uang adat dihapus"); } };
  const loadReference = () => { patchData("adatFunds", [...adatFunds, ...ADAT_REFERENCE.map((r) => ({ ...r, id: uid("adat"), amount: 0, delivered: false, note: "" }))]); notify("Daftar penerima umum dimuat — isi nominalnya sesuai kesepakatan"); };

  return <><PageIntro kicker="KAS ADAT & TUNAI" title="Uang Adat & Kas Tunai" text="Uang tunai yang bukan vendor — sesari pemangku, dana punia, peturunan banjar, tip kru, sangu panitia. Tandai amplop sudah disiapkan / diserahkan supaya tak ada yang terlupa saat hari-H." action={<button className="main-button" onClick={() => open()}>＋ Tambah pos</button>} />
    <div className="data-alert"><strong>Catatan:</strong> besaran sesari, dana punia, dan peturunan mengikuti <em>desa-kala-patra</em> &amp; etika setempat — ini bukan tarif. Angka di sini murni catatan pribadimu; konsultasikan ke pemangku/serati/prajuru banjar untuk yang patut. Pembayaran ke vendor komersial dicatat terpisah di modul <strong>Pengeluaran</strong>.</div>
    <div className="metric-grid"><Metric label="Total Kas Tunai (Rencana)" value={money(total)} tone="green" note={`${adatFunds.length} pos`} /><Metric label="Sudah Diserahkan" value={money(delivered)} note={`${adatFunds.filter((x) => x.delivered).length} amplop`} /><Metric label="Belum Diserahkan" value={money(pending)} note={`${adatFunds.filter((x) => !x.delivered).length} amplop`} /></div>
    {adatFunds.length === 0
      ? <section className="workspace-card"><Empty text="Belum ada pos uang adat. Tambahkan pos di atas, atau muat daftar penerima umum (pemangku, pura, banjar, kru) lalu isi nominalnya sesuai kesepakatan." /><div style={{ textAlign: "center" }}><button className="main-button" onClick={loadReference}>Muat daftar penerima umum</button></div></section>
      : <section className="workspace-card"><div className="list-toolbar"><select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="all">Semua jenis</option>{ADAT_TYPES.map((t) => <option key={t}>{t}</option>)}</select><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">Semua status</option><option value="pending">Belum diserahkan</option><option value="delivered">Sudah diserahkan</option></select></div>
        <div className="record-list">{items.map((item) => <article key={item.id} className={item.delivered ? "is-done" : ""}><button className="check-button" onClick={() => toggle(item.id)} title={item.delivered ? "Tandai belum diserahkan" : "Tandai sudah diserahkan"}>{item.delivered ? "✓" : ""}</button><div><strong>{item.recipient || "Penerima belum diisi"}</strong><small>{item.type}{item.note ? ` · ${item.note}` : ""}</small></div><em className={`pill ${item.delivered ? "paid" : ""}`}>{item.delivered ? "Diserahkan" : "Belum"}</em><b>{money(item.amount)}</b><div className="row-actions"><button onClick={() => open(item)}>Edit</button><button onClick={() => remove(item.id)}>Hapus</button></div></article>)}</div></section>}
    {modal && <Modal title={editing ? "Edit Pos Uang Adat" : "Tambah Pos Uang Adat"} onClose={() => setModal(false)}><form onSubmit={save} className="editor-form"><Field label="Jenis"><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{ADAT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field><Field label="Penerima"><input required value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} placeholder="mis. Pemangku muput" /></Field><Field label="Nominal"><input required type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field><Field label="Status"><select value={form.delivered ? "1" : "0"} onChange={(e) => setForm({ ...form, delivered: e.target.value === "1" })}><option value="0">Belum diserahkan</option><option value="1">Sudah diserahkan</option></select></Field><Field wide label="Catatan"><textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field><FormActions onCancel={() => setModal(false)} /></form></Modal>}
  </>;
}

function RangkaianAcaraView({ data, patchData, notify }) {
  const events = data.project.events || [];
  const [form, setForm] = useState({ name: "", date: "" });
  const [modal, setModal] = useState(false);
  const setEvents = (next) => patchData("project", { ...data.project, events: next });
  const update = (id, field, value) => setEvents(events.map((e) => e.id === id ? { ...e, [field]: value } : e));
  const add = (e) => { e.preventDefault(); setEvents([...events, { id: uid("event"), name: form.name, date: form.date }]); setForm({ name: "", date: "" }); setModal(false); notify("Acara ditambahkan"); };
  const remove = (id) => { if (confirm("Hapus acara ini?")) { setEvents(events.filter((e) => e.id !== id)); notify("Acara dihapus"); } };
  const sorted = [...events].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
  return <><PageIntro kicker="TAHAPAN PAWIWAHAN" title="Rangkaian Acara" text="Daftar acara dari lamaran sampai resepsi — mis. Ngidih, Mekala-kalaan, Resepsi. Tanggal di sini dipakai countdown, rundown, dan kalender." action={<button className="main-button" onClick={() => setModal(true)}>＋ Tambah acara</button>} />
    <div className="data-alert"><strong>Catatan:</strong> urutan &amp; tanggal tiap acara ditentukan kedua keluarga bersama pemangku sesuai <em>desa-kala-patra</em>. Ini catatan perencanaanmu, bukan patokan adat.</div>
    {sorted.length === 0 ? <section className="workspace-card"><Empty text="Belum ada acara. Tambahkan tahapan seperti Ngidih, Pawiwahan, atau Resepsi beserta tanggalnya." /></section>
      : <div className="event-grid">{sorted.map((event) => { const days = event.date ? Math.ceil((new Date(event.date) - new Date()) / 86400000) : null; return <article className="event-card editable" key={event.id}><input className="event-name-input" value={event.name} onChange={(e) => update(event.id, "name", e.target.value)} placeholder="Nama acara" /><input type="date" value={event.date?.slice(0, 10) || ""} onChange={(e) => update(event.id, "date", e.target.value)} /><em>{days === null ? "Tanggal belum diatur" : days < 0 ? "Sudah lewat" : `${days} hari lagi`}</em><CatatanDewasa tanggal={event.date} /><button className="delete-x" onClick={() => remove(event.id)}>×</button></article>; })}</div>}
    {modal && <Modal title="Tambah Acara" onClose={() => setModal(false)}><form className="editor-form" onSubmit={add}><Field wide label="Nama acara"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="mis. Ngidih / Pawiwahan / Resepsi" /></Field><Field label="Tanggal"><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field><FormActions onCancel={() => setModal(false)} /></form></Modal>}
  </>;
}

function RundownView({ data, patchData, notify }) {
  const events = data.project.events || [];
  const rundown = data.rundown || [];
  const empty = { eventId: events[0]?.id || "", time: "", activity: "", pic: "", place: "", note: "" };
  const [form, setForm] = useState(empty);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState("all");
  const eventName = (id) => events.find((e) => e.id === id)?.name || "Umum";
  const items = rundown.filter((r) => tab === "all" || r.eventId === tab).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  const open = (item) => { setEditing(item?.id || null); setForm(item ? { ...item } : { ...empty, eventId: tab !== "all" ? tab : (events[0]?.id || "") }); setModal(true); };
  const save = (e) => { e.preventDefault(); const record = { ...form, id: editing || uid("run") }; patchData("rundown", editing ? rundown.map((x) => x.id === editing ? record : x) : [...rundown, record]); setModal(false); notify(editing ? "Rundown diperbarui" : "Baris rundown ditambahkan"); };
  const remove = (id) => { if (confirm("Hapus baris rundown ini?")) { patchData("rundown", rundown.filter((x) => x.id !== id)); notify("Baris dihapus"); } };
  return <><PageIntro kicker="JADWAL HARI-H" title="Rundown & PIC" text="Susunan jam-per-jam tiap acara beserta penanggung jawab (PIC) dan tempatnya. Buat acara di Rangkaian Acara untuk memisahkan rundown per acara." action={<button className="main-button" onClick={() => open()}>＋ Tambah baris</button>} />
    <div className="data-alert"><strong>Catatan:</strong> jam &amp; urutan acara mengikuti kesepakatan keluarga &amp; pemangku sesuai <em>desa-kala-patra</em> — susunan di sini bantu koordinasi, bukan patokan adat.</div>
    {events.length > 0 && <div className="owner-tabs"><button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>Semua acara</button>{events.map((e) => <button key={e.id} className={tab === e.id ? "active" : ""} onClick={() => setTab(e.id)}>{e.name}</button>)}</div>}
    {items.length === 0 ? <section className="workspace-card"><Empty text="Belum ada rundown. Tambahkan baris jadwal (jam, kegiatan, PIC, tempat) untuk acaramu." /></section>
      : <section className="workspace-card"><div className="record-list">{items.map((r) => <article key={r.id}><span className="record-icon">◷</span><div><strong>{r.activity || "Kegiatan"}</strong><small>{eventName(r.eventId)}{r.pic ? ` · PIC: ${r.pic}` : ""}{r.place ? ` · ${r.place}` : ""}{r.note ? ` · ${r.note}` : ""}</small></div><em className="pill">{r.time || "--:--"}</em><div className="row-actions"><button onClick={() => open(r)}>Edit</button><button onClick={() => remove(r.id)}>Hapus</button></div></article>)}</div></section>}
    {modal && <Modal title={editing ? "Edit Rundown" : "Tambah Rundown"} onClose={() => setModal(false)}><form className="editor-form" onSubmit={save}><Field label="Acara"><select value={form.eventId} onChange={(e) => setForm({ ...form, eventId: e.target.value })}><option value="">Umum</option>{events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field><Field label="Jam"><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field><Field wide label="Kegiatan"><input required value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} placeholder="mis. Mekala-kalaan" /></Field><Field label="PIC"><input value={form.pic} onChange={(e) => setForm({ ...form, pic: e.target.value })} placeholder="Penanggung jawab" /></Field><Field label="Tempat"><input value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} /></Field><Field wide label="Catatan"><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field><FormActions onCancel={() => setModal(false)} /></form></Modal>}
  </>;
}

function KateringView({ data, patchData, notify }) {
  const catering = data.catering || [];
  const events = data.project.events || [];
  const guestPax = sum(data.guests || [], "pax");
  const empty = { event: "", menu: "", pax: guestPax || "", pricePerPax: "", note: "" };
  const [form, setForm] = useState(empty);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const totalPax = sum(catering, "pax");
  const totalCost = catering.reduce((t, c) => t + Number(c.pax || 0) * Number(c.pricePerPax || 0), 0);
  const open = (item) => { setEditing(item?.id || null); setForm(item ? { ...item } : { ...empty }); setModal(true); };
  const save = (e) => { e.preventDefault(); const record = { ...form, id: editing || uid("cat"), pax: Number(form.pax || 0), pricePerPax: Number(form.pricePerPax || 0) }; patchData("catering", editing ? catering.map((x) => x.id === editing ? record : x) : [...catering, record]); setModal(false); notify(editing ? "Konsumsi diperbarui" : "Konsumsi ditambahkan"); };
  const remove = (id) => { if (confirm("Hapus item konsumsi ini?")) { patchData("catering", catering.filter((x) => x.id !== id)); notify("Item dihapus"); } };
  return <><PageIntro kicker="KATERING & KONSUMSI" title="Katering & Konsumsi" text="Rencanakan porsi & biaya konsumsi per acara — dari prosesi kecil sampai resepsi. Jumlah porsi bisa mengikuti daftar tamu." action={<button className="main-button" onClick={() => open()}>＋ Tambah konsumsi</button>} />
    <div className="metric-grid"><Metric label="Total Porsi" value={`${totalPax} pax`} tone="green" note={`${catering.length} pos konsumsi`} /><Metric label="Total Biaya" value={money(totalCost)} /><Metric label="Total Tamu Terdata" value={`${guestPax} pax`} note="dari Daftar Tamu" /></div>
    {catering.length === 0 ? <section className="workspace-card"><Empty text="Belum ada rencana konsumsi. Tambahkan pos katering (mis. Prasmanan resepsi, Konsumsi ngayah) beserta jumlah porsi dan harga per pax." /></section>
      : <section className="workspace-card"><div className="record-list">{catering.map((c) => { const sub = Number(c.pax || 0) * Number(c.pricePerPax || 0); return <article key={c.id}><span className="record-icon">❖</span><div><strong>{c.menu || "Menu"}</strong><small>{c.event || "Umum"} · {c.pax} pax × {money(c.pricePerPax)}{c.note ? ` · ${c.note}` : ""}</small></div><em className="pill">{c.pax} pax</em><b>{money(sub)}</b><div className="row-actions"><button onClick={() => open(c)}>Edit</button><button onClick={() => remove(c.id)}>Hapus</button></div></article>; })}</div></section>}
    {modal && <Modal title={editing ? "Edit Konsumsi" : "Tambah Konsumsi"} onClose={() => setModal(false)}><form className="editor-form" onSubmit={save}><Field label="Acara / sesi"><input list="event-list" value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })} placeholder="mis. Resepsi" /><datalist id="event-list">{events.map((e) => <option key={e.id} value={e.name} />)}</datalist></Field><Field label="Menu / jenis"><input required value={form.menu} onChange={(e) => setForm({ ...form, menu: e.target.value })} placeholder="mis. Nasi campur Bali" /></Field><Field label="Jumlah porsi (pax)"><input type="number" min="0" value={form.pax} onChange={(e) => setForm({ ...form, pax: e.target.value })} /></Field><Field label="Harga per pax"><input type="number" min="0" value={form.pricePerPax} onChange={(e) => setForm({ ...form, pricePerPax: e.target.value })} /></Field><Field wide label="Catatan"><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field><FormActions onCancel={() => setModal(false)} /></form></Modal>}
  </>;
}

const LOGISTIC_REF = {
  Transportasi: [{ item: "Mobil pengantin" }, { item: "Transport keluarga inti" }, { item: "Transport rombongan / ngiring" }],
  Akomodasi: [{ item: "Kamar tamu luar kota" }, { item: "Penginapan kru vendor" }]
};

function TransportasiView({ data, patchData, notify }) {
  const logistics = data.logistics || [];
  const [tab, setTab] = useState("Transportasi");
  const empty = { type: "Transportasi", item: "", detail: "", cost: "", note: "" };
  const [form, setForm] = useState(empty);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const items = logistics.filter((x) => x.type === tab);
  const totalCost = sum(logistics, "cost");
  const open = (item) => { setEditing(item?.id || null); setForm(item ? { ...item } : { ...empty, type: tab }); setModal(true); };
  const save = (e) => { e.preventDefault(); const record = { ...form, id: editing || uid("log"), cost: Number(form.cost || 0) }; patchData("logistics", editing ? logistics.map((x) => x.id === editing ? record : x) : [...logistics, record]); setModal(false); notify(editing ? "Diperbarui" : "Ditambahkan"); };
  const remove = (id) => { if (confirm("Hapus item ini?")) { patchData("logistics", logistics.filter((x) => x.id !== id)); notify("Item dihapus"); } };
  const loadReference = () => { patchData("logistics", [...logistics, ...LOGISTIC_REF[tab].map((r) => ({ ...r, id: uid("log"), type: tab, detail: "", cost: 0, note: "" }))]); notify(`Daftar ${tab.toLowerCase()} umum dimuat`); };
  return <><PageIntro kicker="LOGISTIK HARI-H" title="Transportasi & Akomodasi" text="Catat kebutuhan kendaraan dan penginapan — pengantin, keluarga, rombongan, hingga kru vendor — beserta biayanya." action={<button className="main-button" onClick={() => open()}>＋ Tambah item</button>} />
    <div className="metric-grid"><Metric label="Total Biaya Logistik" value={money(totalCost)} tone="green" note={`${logistics.length} item`} /><Metric label="Transportasi" value={money(sum(logistics.filter((x) => x.type === "Transportasi"), "cost"))} /><Metric label="Akomodasi" value={money(sum(logistics.filter((x) => x.type === "Akomodasi"), "cost"))} /></div>
    <div className="owner-tabs"><button className={tab === "Transportasi" ? "active" : ""} onClick={() => setTab("Transportasi")}>Transportasi</button><button className={tab === "Akomodasi" ? "active" : ""} onClick={() => setTab("Akomodasi")}>Akomodasi</button></div>
    {items.length === 0 ? <section className="workspace-card"><Empty text={`Belum ada ${tab.toLowerCase()}. Tambahkan item atau muat daftar umum.`} /><div style={{ textAlign: "center" }}><button className="main-button" onClick={loadReference}>Muat daftar {tab.toLowerCase()} umum</button></div></section>
      : <section className="workspace-card"><div className="record-list">{items.map((x) => <article key={x.id}><span className="record-icon">⇄</span><div><strong>{x.item || "Item"}</strong><small>{x.detail || "Belum ada detail"}{x.note ? ` · ${x.note}` : ""}</small></div><em className="pill">{x.type}</em><b>{money(x.cost)}</b><div className="row-actions"><button onClick={() => open(x)}>Edit</button><button onClick={() => remove(x.id)}>Hapus</button></div></article>)}</div></section>}
    {modal && <Modal title={editing ? "Edit Logistik" : "Tambah Logistik"} onClose={() => setModal(false)}><form className="editor-form" onSubmit={save}><Field label="Jenis"><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Transportasi</option><option>Akomodasi</option></select></Field><Field label="Item"><input required value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} placeholder="mis. Mobil pengantin" /></Field><Field wide label="Detail"><input value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} placeholder="mis. Sewa 1 hari + sopir" /></Field><Field label="Biaya"><input type="number" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></Field><Field label="Catatan"><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field><FormActions onCancel={() => setModal(false)} /></form></Modal>}
  </>;
}

const EMERGENCY_REF = [
  { item: "Jarum & benang jahit", category: "Busana" }, { item: "Peniti & double tape", category: "Busana" },
  { item: "Penghapus noda / tisu basah", category: "Busana" }, { item: "Sisir & cermin kecil", category: "Busana" },
  { item: "Obat pereda nyeri & minyak angin", category: "Kesehatan" }, { item: "Plester luka", category: "Kesehatan" },
  { item: "Air mineral & snack ringan", category: "Kesehatan" }, { item: "Powerbank & kabel charger", category: "Elektronik" },
  { item: "Fotokopi KTP, KK & surat", category: "Dokumen" }, { item: "Salinan kontrak vendor", category: "Dokumen" },
  { item: "Uang tunai cadangan", category: "Lainnya" }, { item: "Payung", category: "Lainnya" }
];

function EmergencyKitView({ data, patchData, notify }) {
  const kit = data.emergencyKit || [];
  const [form, setForm] = useState({ item: "", category: "Lainnya" });
  const [modal, setModal] = useState(false);
  const done = kit.filter((x) => x.checked).length;
  const toggle = (id) => patchData("emergencyKit", kit.map((x) => x.id === id ? { ...x, checked: !x.checked } : x));
  const save = (e) => { e.preventDefault(); patchData("emergencyKit", [...kit, { ...form, id: uid("kit"), checked: false }]); setForm({ item: "", category: "Lainnya" }); setModal(false); notify("Item ditambahkan"); };
  const remove = (id) => { if (confirm("Hapus item ini dari emergency kit?")) { patchData("emergencyKit", kit.filter((x) => x.id !== id)); notify("Item dihapus"); } };
  const loadReference = () => { patchData("emergencyKit", [...kit, ...EMERGENCY_REF.map((r) => ({ ...r, id: uid("kit"), checked: false }))]); notify("Daftar emergency kit umum dimuat"); };
  return <><PageIntro kicker="SIAP SEDIA HARI-H" title="Emergency Kit Hari H" text="Checklist barang darurat yang wajib ada di lokasi — dari jarum jahit sampai powerbank — supaya masalah kecil tak jadi drama." action={<button className="main-button" onClick={() => setModal(true)}>＋ Tambah item</button>} />
    <div className="document-progress"><div><strong>{done}/{kit.length}</strong><span>item siap</span></div><div className="big-progress"><span style={{ width: `${kit.length ? done / kit.length * 100 : 0}%` }} /></div></div>
    {kit.length === 0 ? <section className="workspace-card"><Empty text="Belum ada emergency kit. Muat daftar umum lalu sesuaikan dengan kebutuhanmu." /><div style={{ textAlign: "center" }}><button className="main-button" onClick={loadReference}>Muat daftar emergency kit umum</button></div></section>
      : <section className="workspace-card document-list">{kit.map((x) => <article key={x.id} className={x.checked ? "is-done" : ""}><button className="check-button" onClick={() => toggle(x.id)}>{x.checked ? "✓" : ""}</button><div><strong>{x.item}</strong><small>{x.category}</small></div><button className="delete-x" onClick={() => remove(x.id)}>×</button></article>)}</section>}
    {modal && <Modal title="Tambah Item Emergency Kit" onClose={() => setModal(false)}><form className="editor-form" onSubmit={save}><Field wide label="Nama barang"><input required value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} /></Field><Field wide label="Kategori"><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Busana</option><option>Kesehatan</option><option>Elektronik</option><option>Dokumen</option><option>Lainnya</option></select></Field><FormActions onCancel={() => setModal(false)} /></form></Modal>}
  </>;
}

function VendorCompareView({ data, patchData, notify }) {
  const list = data.vendorCompare || [];
  const categories = data.categories || [];
  const empty = { name: "", category: categories[0]?.name || "MUA", price: "", rating: 3, note: "", chosen: false };
  const [form, setForm] = useState(empty);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("all");
  const cats = [...new Set(list.map((v) => v.category))];
  const items = list.filter((v) => filter === "all" || v.category === filter).sort((a, b) => (b.rating || 0) - (a.rating || 0) || Number(a.price || 0) - Number(b.price || 0));
  const open = (item) => { setEditing(item?.id || null); setForm(item ? { ...item } : { ...empty }); setModal(true); };
  const save = (e) => { e.preventDefault(); const record = { ...form, id: editing || uid("vc"), price: Number(form.price || 0), rating: Number(form.rating) }; patchData("vendorCompare", editing ? list.map((x) => x.id === editing ? record : x) : [...list, record]); setModal(false); notify(editing ? "Kandidat diperbarui" : "Kandidat ditambahkan"); };
  const toggleChosen = (id) => patchData("vendorCompare", list.map((x) => x.id === id ? { ...x, chosen: !x.chosen } : x));
  const remove = (id) => { if (confirm("Hapus kandidat vendor ini?")) { patchData("vendorCompare", list.filter((x) => x.id !== id)); notify("Kandidat dihapus"); } };
  return <><PageIntro kicker="BANDINGKAN KANDIDAT" title="Banding Vendor" text="Kumpulkan beberapa kandidat vendor per kategori, beri nilai dan harga, lalu tandai yang kamu pilih. Kandidat terurut dari nilai tertinggi." action={<button className="main-button" onClick={() => open()}>＋ Tambah kandidat</button>} />
    {list.length === 0 ? <section className="workspace-card"><Empty text="Belum ada kandidat. Tambahkan beberapa vendor (mis. 3 MUA) beserta harga & nilai untuk membandingkan." /></section>
      : <section className="workspace-card"><div className="list-toolbar solo"><select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">Semua kategori</option>{cats.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="record-list">{items.map((v) => <article key={v.id} className={v.chosen ? "is-chosen" : ""}><span className="record-icon">{v.chosen ? "★" : "◇"}</span><div><strong>{v.name || "Vendor"}</strong><small>{v.category}{v.note ? ` · ${v.note}` : ""}</small></div><em className="pill">{"★".repeat(v.rating || 0)}{"☆".repeat(5 - (v.rating || 0))}</em><b>{money(v.price)}</b><div className="row-actions"><button onClick={() => toggleChosen(v.id)}>{v.chosen ? "Batal" : "Pilih"}</button><button onClick={() => open(v)}>Edit</button><button onClick={() => remove(v.id)}>Hapus</button></div></article>)}</div></section>}
    {modal && <Modal title={editing ? "Edit Kandidat" : "Tambah Kandidat"} onClose={() => setModal(false)}><form className="editor-form" onSubmit={save}><Field label="Nama vendor"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><Field label="Kategori"><input list="vc-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /><datalist id="vc-cat">{categories.map((c) => <option key={c.id} value={c.name} />)}</datalist></Field><Field label="Harga"><input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field><Field label="Nilai (1–5)"><select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} ({n})</option>)}</select></Field><Field wide label="Catatan"><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="mis. include hairdo, ramah, respon cepat" /></Field><FormActions onCancel={() => setModal(false)} /></form></Modal>}
  </>;
}

const SHOT_REF = [
  { shot: "Detail cincin & mahar", category: "Detail" }, { shot: "Detail dekorasi & penjor", category: "Detail" },
  { shot: "Prosesi Mekala-kalaan", category: "Prosesi" }, { shot: "Prosesi Mewidhi Widana", category: "Prosesi" },
  { shot: "Foto keluarga besar kedua pihak", category: "Keluarga" }, { shot: "Pengantin bersama orang tua", category: "Keluarga" },
  { shot: "Kandid tamu & suasana", category: "Kandid" }, { shot: "Potong kue / toast resepsi", category: "Resepsi" }
];

function ShotListView({ data, patchData, notify }) {
  const shots = data.shotList || [];
  const [form, setForm] = useState({ shot: "", category: "Detail" });
  const [modal, setModal] = useState(false);
  const done = shots.filter((x) => x.checked).length;
  const toggle = (id) => patchData("shotList", shots.map((x) => x.id === id ? { ...x, checked: !x.checked } : x));
  const save = (e) => { e.preventDefault(); patchData("shotList", [...shots, { ...form, id: uid("shot"), checked: false }]); setForm({ shot: "", category: "Detail" }); setModal(false); notify("Shot ditambahkan"); };
  const remove = (id) => { if (confirm("Hapus shot ini?")) { patchData("shotList", shots.filter((x) => x.id !== id)); notify("Shot dihapus"); } };
  const loadReference = () => { patchData("shotList", [...shots, ...SHOT_REF.map((r) => ({ ...r, id: uid("shot"), checked: false }))]); notify("Daftar shot umum dimuat"); };
  return <><PageIntro kicker="DAFTAR MOMEN FOTO" title="Shot List Dokumentasi" text="Daftar momen wajib untuk fotografer & videografer — supaya tak ada momen penting yang terlewat. Bagikan ke tim dokumentasimu." action={<button className="main-button" onClick={() => setModal(true)}>＋ Tambah shot</button>} />
    <div className="document-progress"><div><strong>{done}/{shots.length}</strong><span>shot ditandai</span></div><div className="big-progress"><span style={{ width: `${shots.length ? done / shots.length * 100 : 0}%` }} /></div></div>
    {shots.length === 0 ? <section className="workspace-card"><Empty text="Belum ada shot list. Muat daftar umum lalu sesuaikan dengan momen yang kamu inginkan." /><div style={{ textAlign: "center" }}><button className="main-button" onClick={loadReference}>Muat daftar shot umum</button></div></section>
      : <section className="workspace-card document-list">{shots.map((x) => <article key={x.id} className={x.checked ? "is-done" : ""}><button className="check-button" onClick={() => toggle(x.id)}>{x.checked ? "✓" : ""}</button><div><strong>{x.shot}</strong><small>{x.category}</small></div><button className="delete-x" onClick={() => remove(x.id)}>×</button></article>)}</section>}
    {modal && <Modal title="Tambah Shot" onClose={() => setModal(false)}><form className="editor-form" onSubmit={save}><Field wide label="Momen / shot"><input required value={form.shot} onChange={(e) => setForm({ ...form, shot: e.target.value })} /></Field><Field wide label="Kategori"><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Detail</option><option>Prosesi</option><option>Keluarga</option><option>Kandid</option><option>Resepsi</option></select></Field><FormActions onCancel={() => setModal(false)} /></form></Modal>}
  </>;
}

const POSTWED_REF = [
  { task: "Lapor & sungkem ke banjar / desa adat", when: "H+7–30" },
  { task: "Urus Akta Perkawinan di Dukcapil", when: "H+1–60" },
  { task: "Ganti status & alamat di KTP", when: "H+30" },
  { task: "Buat Kartu Keluarga (KK) baru", when: "H+30" },
  { task: "Update data BPJS Kesehatan", when: "H+30" },
  { task: "Kirim ucapan terima kasih ke tamu & vendor", when: "H+1–14" },
  { task: "Terima & backup foto/video dari fotografer", when: "H+14–30" }
];

function PascaNikahView({ data, patchData, notify }) {
  const tasks = data.postWedding || [];
  const [form, setForm] = useState({ task: "", when: "" });
  const [modal, setModal] = useState(false);
  const done = tasks.filter((x) => x.checked).length;
  const toggle = (id) => patchData("postWedding", tasks.map((x) => x.id === id ? { ...x, checked: !x.checked } : x));
  const save = (e) => { e.preventDefault(); patchData("postWedding", [...tasks, { ...form, id: uid("pw"), checked: false }]); setForm({ task: "", when: "" }); setModal(false); notify("Tugas ditambahkan"); };
  const remove = (id) => { if (confirm("Hapus tugas pasca-nikah ini?")) { patchData("postWedding", tasks.filter((x) => x.id !== id)); notify("Tugas dihapus"); } };
  const loadReference = () => { patchData("postWedding", [...tasks, ...POSTWED_REF.map((r) => ({ ...r, id: uid("pw"), checked: false }))]); notify("Checklist pasca-nikah umum dimuat"); };
  return <><PageIntro kicker="TUNTAS SETELAH ACARA" title="Checklist Pasca-Nikah" text="Urusan administrasi & adat setelah hari-H — dari lapor banjar sampai akta & KTP baru. Tandai satu per satu supaya tuntas dengan tenang." action={<button className="main-button" onClick={() => setModal(true)}>＋ Tambah tugas</button>} />
    <div className="document-progress"><div><strong>{done}/{tasks.length}</strong><span>tugas selesai</span></div><div className="big-progress"><span style={{ width: `${tasks.length ? done / tasks.length * 100 : 0}%` }} /></div></div>
    {tasks.length === 0 ? <section className="workspace-card"><Empty text="Belum ada checklist. Muat daftar umum (lapor banjar, akta, KTP, BPJS) lalu sesuaikan." /><div style={{ textAlign: "center" }}><button className="main-button" onClick={loadReference}>Muat checklist pasca-nikah umum</button></div></section>
      : <section className="workspace-card document-list">{tasks.map((x) => <article key={x.id} className={x.checked ? "is-done" : ""}><button className="check-button" onClick={() => toggle(x.id)}>{x.checked ? "✓" : ""}</button><div><strong>{x.task}</strong><small>{x.when || "Tanpa tenggat"}</small></div><button className="delete-x" onClick={() => remove(x.id)}>×</button></article>)}</section>}
    {modal && <Modal title="Tambah Tugas Pasca-Nikah" onClose={() => setModal(false)}><form className="editor-form" onSubmit={save}><Field wide label="Tugas"><input required value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value })} /></Field><Field wide label="Kapan (opsional)"><input value={form.when} onChange={(e) => setForm({ ...form, when: e.target.value })} placeholder="mis. H+30" /></Field><FormActions onCancel={() => setModal(false)} /></form></Modal>}
  </>;
}

function PlaylistView({ data, patchData, notify }) {
  const songs = data.playlist || [];
  const empty = { title: "", artist: "", moment: "Resepsi", link: "" };
  const [form, setForm] = useState(empty);
  const [modal, setModal] = useState(false);
  const [tab, setTab] = useState("all");
  const MOMENTS = ["Prosesi", "Penyambutan", "Resepsi", "Dansa"];
  const items = songs.filter((s) => tab === "all" || s.moment === tab);
  const [editing, setEditing] = useState(null);
  const open = (item) => { setEditing(item?.id || null); setForm(item ? { ...item } : { ...empty }); setModal(true); };
  const save = (e) => { e.preventDefault(); const record = { ...form, id: editing || uid("song") }; patchData("playlist", editing ? songs.map((x) => x.id === editing ? record : x) : [...songs, record]); setForm(empty); setEditing(null); setModal(false); notify(editing ? "Lagu diperbarui" : "Lagu ditambahkan"); };
  const remove = (id) => { if (confirm("Hapus lagu ini dari playlist?")) { patchData("playlist", songs.filter((x) => x.id !== id)); notify("Lagu dihapus"); } };
  return <><PageIntro kicker="MUSIK ACARA" title="Wedding Playlist" text="Kumpulkan lagu untuk tiap momen — prosesi, penyambutan, resepsi, dansa — lengkap dengan tautannya untuk dibagikan ke MC / sound system." action={<button className="main-button" onClick={() => open()}>＋ Tambah lagu</button>} />
    <div className="owner-tabs"><button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>Semua</button>{MOMENTS.map((m) => <button key={m} className={tab === m ? "active" : ""} onClick={() => setTab(m)}>{m}</button>)}</div>
    {items.length === 0 ? <section className="workspace-card"><Empty text="Belum ada lagu. Tambahkan lagu favorit beserta momen dan tautannya." /></section>
      : <section className="workspace-card simple-list">{items.map((s) => <article key={s.id}><div><strong>{s.title || "Judul lagu"}</strong><small>{s.artist || "Artis"} · {s.moment}</small></div>{s.link && <a href={s.link} target="_blank" rel="noreferrer">Buka ↗</a>}<div className="row-actions"><button onClick={() => open(s)}>Edit</button><button onClick={() => remove(s.id)}>Hapus</button></div></article>)}</section>}
    {modal && <Modal title={editing ? "Edit Lagu" : "Tambah Lagu"} onClose={() => setModal(false)}><form className="editor-form" onSubmit={save}><Field label="Judul"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field><Field label="Artis"><input value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} /></Field><Field label="Momen"><select value={form.moment} onChange={(e) => setForm({ ...form, moment: e.target.value })}>{MOMENTS.map((m) => <option key={m}>{m}</option>)}</select></Field><Field label="Tautan (YouTube/Spotify)"><input type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></Field><FormActions onCancel={() => setModal(false)} /></form></Modal>}
  </>;
}

function CatatanView({ data, patchData, notify }) {
  const notes = data.notes || [];
  const empty = { title: "", body: "" };
  const [form, setForm] = useState(empty);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const open = (item) => { setEditing(item?.id || null); setForm(item ? { title: item.title, body: item.body } : empty); setModal(true); };
  const save = (e) => { e.preventDefault(); const record = { ...form, id: editing || uid("note"), date: new Date().toISOString() }; patchData("notes", editing ? notes.map((x) => x.id === editing ? { ...x, ...record } : x) : [...notes, record]); setModal(false); notify(editing ? "Catatan diperbarui" : "Catatan ditambahkan"); };
  const remove = (id) => { if (confirm("Hapus catatan ini?")) { patchData("notes", notes.filter((x) => x.id !== id)); notify("Catatan dihapus"); } };
  return <><PageIntro kicker="CATATAN BEBAS" title="Catatan" text="Tempat menyimpan ide, hasil diskusi keluarga, atau pengingat apa pun yang belum punya modulnya sendiri." action={<button className="main-button" onClick={() => open()}>＋ Tambah catatan</button>} />
    {notes.length === 0 ? <section className="workspace-card"><Empty text="Belum ada catatan. Tambahkan catatan pertama untuk menyimpan ide atau hasil diskusi." /></section>
      : <section className="workspace-card simple-list">{[...notes].reverse().map((n) => <article key={n.id}><div><strong>{n.title || "Tanpa judul"}</strong><small>{n.body}</small></div><div className="row-actions"><button onClick={() => open(n)}>Edit</button><button onClick={() => remove(n.id)}>Hapus</button></div></article>)}</section>}
    {modal && <Modal title={editing ? "Edit Catatan" : "Tambah Catatan"} onClose={() => setModal(false)}><form className="editor-form" onSubmit={save}><Field wide label="Judul"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field><Field wide label="Isi catatan"><textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Field><FormActions onCancel={() => setModal(false)} /></form></Modal>}
  </>;
}

function PendanaanView({ data, patchData, notify }) {
  const sources = data.project.fundingSources || [];
  const [form, setForm] = useState({ name: "", amount: "", received: "" });
  const [modal, setModal] = useState(false);
  const setSources = (next) => patchData("project", { ...data.project, fundingSources: next });
  const update = (id, field, value) => setSources(sources.map((s) => s.id === id ? { ...s, [field]: Number(value) } : s));
  const add = (e) => { e.preventDefault(); setSources([...sources, { id: uid("fund"), name: form.name, amount: Number(form.amount), received: Number(form.received || 0) }]); setForm({ name: "", amount: "", received: "" }); setModal(false); notify("Sumber dana ditambahkan"); };
  const remove = (id) => { if (confirm("Hapus sumber dana ini?")) { setSources(sources.filter((s) => s.id !== id)); notify("Sumber dana dihapus"); } };
  const pledged = sum(sources, "amount");
  const received = sources.reduce((t, s) => t + Number(s.received || 0), 0);
  return <><PageIntro kicker="SUMBER DANA & PATUNGAN" title="Pendanaan & Patungan" text="Siapa menyumbang berapa, dan berapa yang sudah benar-benar terkumpul. Hanya dana yang sudah diterima yang bisa dipakai membayar di muka." action={<button className="main-button" onClick={() => setModal(true)}>＋ Tambah sumber</button>} />
    <div className="metric-grid"><Metric label="Total Dijanjikan" value={money(pledged)} note={`${sources.length} kontributor`} /><Metric label="Sudah Terkumpul" value={money(received)} tone="green" note={`${pledged ? Math.round(received / pledged * 100) : 0}% dari janji`} /><Metric label="Belum Cair" value={money(pledged - received)} /></div>
    {sources.length === 0 ? <section className="workspace-card"><Empty text="Belum ada sumber dana. Tambahkan kontributor (mis. Orang tua pria, tabungan pasangan) beserta jumlah yang dijanjikan." /></section>
      : <section className="workspace-card budget-table-card"><CardHead kicker="KONTRIBUSI" title="Sumber Dana" action={money(received)} /><div className="data-table budget-table"><div className="table-head"><span>Kontributor</span><span>Dijanjikan</span><span>Terkumpul</span><span>Sisa</span><span>Progres</span></div>{sources.map((s) => { const rec = Number(s.received || 0); const ratio = s.amount ? rec / s.amount * 100 : rec ? 100 : 0; return <div className="table-row" key={s.id}><strong>{s.name}<button className="delete-x inline" onClick={() => remove(s.id)}>×</button></strong><label className="money-cell">Rp <input type="number" value={s.amount} onChange={(e) => update(s.id, "amount", e.target.value)} /></label><label className="money-cell">Rp <input type="number" value={rec} onChange={(e) => update(s.id, "received", e.target.value)} /></label><span className={s.amount - rec > 0 ? "" : "positive-text"}>{money(s.amount - rec)}</span><div className="row-progress"><i style={{ width: `${Math.min(ratio, 100)}%` }} /><small>{Math.round(ratio)}%</small></div></div>; })}</div></section>}
    {modal && <Modal title="Tambah Sumber Dana" onClose={() => setModal(false)}><form className="editor-form" onSubmit={add}><Field wide label="Kontributor"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="mis. Orang tua wanita" /></Field><Field label="Dijanjikan"><input required type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field><Field label="Sudah terkumpul"><input type="number" min="0" value={form.received} onChange={(e) => setForm({ ...form, received: e.target.value })} /></Field><FormActions onCancel={() => setModal(false)} /></form></Modal>}
  </>;
}

function PaymentVendorView({ data, patchData, notify }) {
  const payments = data.vendorPayments || [];
  const categories = data.categories || [];
  const empty = { vendor: "", category: categories[0]?.name || "Lainnya", total: "", paid: "", dueDate: "", note: "" };
  const [form, setForm] = useState(empty);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const statusOf = (p) => { const paid = Number(p.paid || 0), total = Number(p.total || 0); return paid <= 0 ? "Belum bayar" : paid >= total ? "Lunas" : "Sebagian"; };
  const open = (item) => { setEditing(item?.id || null); setForm(item ? { ...item } : { ...empty }); setModal(true); };
  const save = (e) => { e.preventDefault(); const record = { ...form, id: editing || uid("pay"), total: Number(form.total), paid: Number(form.paid || 0) }; patchData("vendorPayments", editing ? payments.map((x) => x.id === editing ? record : x) : [...payments, record]); setModal(false); notify(editing ? "Pembayaran diperbarui" : "Pembayaran ditambahkan"); };
  const remove = (id) => { if (confirm("Hapus catatan pembayaran ini?")) { patchData("vendorPayments", payments.filter((x) => x.id !== id)); notify("Catatan dihapus"); } };
  const totalContract = sum(payments, "total");
  const totalPaid = payments.reduce((t, p) => t + Number(p.paid || 0), 0);
  const upcoming = payments.filter((p) => p.dueDate && statusOf(p) !== "Lunas").sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  return <><PageIntro kicker="REALISASI BAYAR VENDOR" title="Payment Vendor Tracker" text="Lacak nilai kontrak, DP, cicilan, dan pelunasan tiap vendor komersial beserta jatuh temponya — supaya tak ada yang lupa dilunasi." action={<button className="main-button" onClick={() => open()}>＋ Tambah vendor</button>} />
    <div className="metric-grid"><Metric label="Total Kontrak" value={money(totalContract)} note={`${payments.length} vendor`} /><Metric label="Sudah Dibayar" value={money(totalPaid)} tone="green" /><Metric label="Sisa Tagihan" value={money(totalContract - totalPaid)} /><Metric label="Jatuh Tempo Terdekat" value={upcoming ? prettyDate(upcoming.dueDate) : "—"} note={upcoming ? upcoming.vendor : "Tak ada tagihan"} /></div>
    {payments.length === 0 ? <section className="workspace-card"><Empty text="Belum ada catatan pembayaran vendor. Tambahkan vendor beserta nilai kontrak, yang sudah dibayar, dan tanggal jatuh tempo pelunasan." /></section>
      : <section className="workspace-card"><div className="record-list">{payments.map((p) => { const paid = Number(p.paid || 0), total = Number(p.total || 0), st = statusOf(p); const overdue = p.dueDate && new Date(p.dueDate) < new Date() && st !== "Lunas"; return <article key={p.id}><span className="record-icon">◇</span><div><strong>{p.vendor || "Vendor"}</strong><small>{p.category} · dibayar {money(paid)} / {money(total)}{p.dueDate ? ` · tempo ${prettyDate(p.dueDate)}` : ""}{p.note ? ` · ${p.note}` : ""}</small></div><em className={`pill ${st === "Lunas" ? "paid" : overdue ? "late" : ""}`}>{overdue ? "Telat" : st}</em><b>{money(total - paid)}</b><div className="row-actions"><button onClick={() => open(p)}>Edit</button><button onClick={() => remove(p.id)}>Hapus</button></div></article>; })}</div></section>}
    {modal && <Modal title={editing ? "Edit Pembayaran Vendor" : "Tambah Pembayaran Vendor"} onClose={() => setModal(false)}><form className="editor-form" onSubmit={save}><Field label="Vendor"><input required value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="mis. MUA Payas Agung" /></Field><Field label="Kategori"><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((c) => <option key={c.id}>{c.name}</option>)}<option>Lainnya</option></select></Field><Field label="Nilai kontrak"><input required type="number" min="0" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} /></Field><Field label="Sudah dibayar"><input type="number" min="0" value={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.value })} /></Field><Field label="Jatuh tempo"><input type="date" value={form.dueDate?.slice(0, 10) || ""} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Field><Field wide label="Catatan"><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field><FormActions onCancel={() => setModal(false)} /></form></Modal>}
  </>;
}

function SavingPlannerView({ data, patchData, notify }) {
  const saving = data.saving || { target: 0, saved: 0, targetDate: "" };
  const events = data.project.events || [];
  const nextDate = saving.targetDate || [...events].filter((e) => e.date).sort((a, b) => a.date.localeCompare(b.date)).find((e) => new Date(e.date) >= new Date())?.date || "";
  const set = (field, value) => patchData("saving", { ...saving, [field]: field === "targetDate" ? value : Number(value) });
  const target = Number(saving.target || 0), saved = Number(saving.saved || 0);
  const monthsLeft = nextDate ? Math.max(0, Math.ceil((new Date(nextDate) - new Date()) / (86400000 * 30))) : 0;
  const remaining = Math.max(0, target - saved);
  const perMonth = monthsLeft > 0 ? Math.ceil(remaining / monthsLeft) : remaining;
  const ratio = target ? Math.min(saved / target * 100, 100) : 0;
  return <><PageIntro kicker="RENCANA MENABUNG" title="Wedding Saving Planner" text="Tetapkan target dana, isi yang sudah terkumpul, dan lihat berapa yang perlu disisihkan tiap bulan sampai hari-H." />
    <div className="metric-grid"><Metric label="Target Dana" value={money(target)} /><Metric label="Sudah Ditabung" value={money(saved)} tone="green" note={`${Math.round(ratio)}% tercapai`} /><Metric label="Perlu Disisihkan / Bulan" value={money(perMonth)} note={monthsLeft ? `${monthsLeft} bulan tersisa` : "Tanggal target belum diatur"} /></div>
    <div className="two-column">
      <section className="workspace-card"><CardHead kicker="PENGATURAN" title="Target Tabungan" /><label className="inline-form"><span>Target dana (Rp)</span><input type="number" min="0" value={target} onChange={(e) => set("target", e.target.value)} /></label><label className="inline-form"><span>Sudah ditabung (Rp)</span><input type="number" min="0" value={saved} onChange={(e) => set("saved", e.target.value)} /></label><label className="inline-form"><span>Tanggal target</span><input type="date" value={nextDate?.slice(0, 10) || ""} onChange={(e) => set("targetDate", e.target.value)} /></label>{!saving.targetDate && nextDate && <small className="hint">Otomatis mengikuti acara terdekat. Ubah bila ingin target sendiri.</small>}</section>
      <section className="workspace-card"><CardHead kicker="PROGRES" title="Menuju Target" action={`${Math.round(ratio)}%`} /><div className="big-progress"><span style={{ width: `${ratio}%` }} /></div><p className="save-summary">{remaining > 0 ? <>Sisa <strong>{money(remaining)}</strong> lagi. Dengan {monthsLeft || "—"} bulan tersisa, sisihkan sekitar <strong>{money(perMonth)}</strong> per bulan.</> : target > 0 ? <>Target tercapai — kerja bagus! 🎉</> : <>Isi target dana untuk mulai menghitung.</>}</p></section>
    </div>
  </>;
}

function RingkasanKeuanganView({ data, onNavigate }) {
  const sources = data.project.fundingSources || [];
  const received = sources.reduce((t, s) => t + Number(s.received || 0), 0);
  const allocation = sum(data.categories || [], "allocation");
  const expensesPaid = sum(data.expenses || [], "amount");
  const vendorPaid = (data.vendorPayments || []).reduce((t, p) => t + Number(p.paid || 0), 0);
  const adatFunds = data.adatFunds || [];
  const adatTotal = sum(adatFunds, "amount");
  const adatDelivered = sum(adatFunds.filter((x) => x.delivered), "amount");
  const saving = data.saving || {};
  const paidOut = expensesPaid + vendorPaid + adatDelivered;
  const needs = allocation + adatTotal;
  const gap = received - needs;
  const Card = ({ label, value, note, tone, to }) => <article className={`planner-metric ${tone || ""} ${to ? "clickable" : ""}`} onClick={to ? () => onNavigate(to) : undefined}><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</article>;
  return <><PageIntro kicker="ARUS UANG PAWIWAHAN" title="Ringkasan Keuangan" text="Satu tempat melihat dari mana dana datang, ke mana perginya, dan apakah cukup. Klik kartu untuk membuka modulnya." />
    <div className="metric-grid"><Card label="Dana Terkumpul" value={money(received)} note="pendanaan diterima" tone="green" to="funding" /><Card label="Rencana Belanja" value={money(allocation)} note="anggaran vendor" to="budget" /><Card label="Kas Adat" value={money(adatTotal)} note={`${money(adatDelivered)} diserahkan`} to="adat" /><Card label="Sudah Keluar" value={money(paidOut)} note="vendor + kas adat" to="payments" /></div>
    <div className="two-column">
      <section className="workspace-card"><CardHead kicker="KONDISI DANA" title={gap >= 0 ? "Perkiraan cukup" : "Perkiraan kurang"} /><div className={`finance-verdict ${gap >= 0 ? "ok" : "short"}`}><strong>{money(Math.abs(gap))}</strong><span>{gap >= 0 ? "dana terkumpul melebihi kebutuhan tercatat" : "kebutuhan tercatat melebihi dana terkumpul"}</span></div><div className="finance-lines"><div><span>Kebutuhan (budget + kas adat)</span><b>{money(needs)}</b></div><div><span>Dana terkumpul</span><b>{money(received)}</b></div><div><span>Sisa harus dibayar</span><b>{money(Math.max(0, needs - paidOut))}</b></div></div></section>
      <section className="workspace-card"><CardHead kicker="CATATAN" title="Cara angka dihitung" /><ul className="calc-notes"><li>Dana = pendanaan yang sudah <strong>diterima</strong>. Angpao tidak dihitung karena baru masuk saat hari-H.</li><li>Kebutuhan = rencana Budget + Kas adat.</li><li>Tabungan {saving.target ? <>menuju target {money(saving.target)} ({money(saving.saved || 0)} terkumpul)</> : "belum diatur"} — ditampilkan sebagai progres, tidak ditambahkan ke dana agar tak tumpang tindih.</li><li>Besaran adat (sesari, punia, peturunan) = etika <em>desa-kala-patra</em>, bukan tarif.</li></ul></section>
    </div>
  </>;
}

function ChecklistView({data,patchData,notify}) {
  const empty={task:"",status:"BELUM",done:false,vendor:"",dueDate:"",notes:""}; const [form,setForm]=useState(empty);const[modal,setModal]=useState(false);const[editing,setEditing]=useState(null);const[filter,setFilter]=useState("all");
  const items=data.checklist.filter(x=>filter==="all"||(filter==="done"?x.done:!x.done));
  const toggle=(id)=>patchData("checklist",data.checklist.map(x=>x.id===id?{...x,done:!x.done,status:!x.done?"DONE":"BELUM"}:x));
  const open=(item)=>{setEditing(item?.id||null);setForm(item?{...item}:{...empty});setModal(true)};
  const save=(e)=>{e.preventDefault();const record={...form,id:editing||uid("task"),done:form.status==="DONE"};patchData("checklist",editing?data.checklist.map(x=>x.id===editing?record:x):[...data.checklist,record]);setModal(false);setForm(empty);setEditing(null);notify(editing?"Tugas diperbarui":"Tugas ditambahkan")};
  const remove=(id)=>{if(confirm("Hapus tugas ini dari checklist?")){patchData("checklist",data.checklist.filter(x=>x.id!==id));notify("Tugas dihapus")}};
  return <><PageIntro kicker={`${data.checklist.length} TUGAS PERSIAPAN`} title="Checklist persiapan" text="Tentukan status, vendor, tenggat, dan catatan untuk setiap pekerjaan." action={<button className="main-button" onClick={()=>open()}>＋ Tambah tugas</button>} />
    <div className="check-summary"><button className={filter==="all"?"active":""} onClick={()=>setFilter("all")}><strong>{data.checklist.length}</strong><span>Semua</span></button><button className={filter==="todo"?"active":""} onClick={()=>setFilter("todo")}><strong>{data.checklist.filter(x=>!x.done).length}</strong><span>Belum selesai</span></button><button className={filter==="done"?"active":""} onClick={()=>setFilter("done")}><strong>{data.checklist.filter(x=>x.done).length}</strong><span>Selesai</span></button></div>
    <section className="workspace-card checklist-list">{items.map(item=><article key={item.id} className={item.done?"is-done":""}><button className="check-button" onClick={()=>toggle(item.id)}>{item.done?"✓":""}</button><div><strong>{item.task}</strong><small>{item.vendor||"Vendor belum dipilih"}{item.notes?` · ${item.notes}`:""}</small></div><select value={item.status} onChange={e=>patchData("checklist",data.checklist.map(x=>x.id===item.id?{...x,status:e.target.value,done:e.target.value==="DONE"}:x))}><option>BELUM</option><option>ON PROCESS</option><option>DONE</option></select><time className={item.dueDate&&new Date(item.dueDate)<new Date()&&!item.done?"late":""}>{item.dueDate?prettyDate(item.dueDate):"Tanpa tenggat"}</time><div className="row-actions"><button onClick={()=>open(item)}>Edit</button><button onClick={()=>remove(item.id)}>Hapus</button></div></article>)}</section>
    {modal&&<Modal title={editing?"Edit Tugas":"Tambah Tugas"} onClose={()=>setModal(false)}><form onSubmit={save} className="editor-form"><Field wide label="Nama tugas"><input required value={form.task} onChange={e=>setForm({...form,task:e.target.value})}/></Field><Field label="Status"><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>BELUM</option><option>ON PROCESS</option><option>DONE</option></select></Field><Field label="Tenggat"><input type="date" value={form.dueDate?.slice(0,10)||""} onChange={e=>setForm({...form,dueDate:e.target.value})}/></Field><Field label="Vendor"><input value={form.vendor} onChange={e=>setForm({...form,vendor:e.target.value})}/></Field><Field label="Catatan"><input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></Field><FormActions onCancel={()=>setModal(false)}/></form></Modal>}
  </>;
}

function VendorView({data,patchData,notify}) {
  const[query,setQuery]=useState(""); const [expanded,setExpanded]=useState(null);
  const list=data.muaVendors.filter(v=>v.name.toLowerCase().includes(query.toLowerCase()));
  const toggleShortlist=(id)=>{patchData("muaVendors",data.muaVendors.map(v=>v.id===id?{...v,shortlisted:!v.shortlisted}:v));notify("Shortlist vendor diperbarui")};
  return <><PageIntro kicker="DATABASE EXCEL" title="Vendor Make Up Artist" text={`${data.muaVendors.length} vendor lengkap dengan paket, harga owner/team, kontak, dan cakupan layanan.`}/><div className="list-toolbar solo"><input placeholder="Cari nama vendor..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="vendor-grid">{list.map(v=>{const harga=v.packages.map(p=>p.ownerPrice||p.teamPrice).filter(Boolean); return <article className={`vendor-card ${v.shortlisted?"selected":""}`} key={v.id}><div className="vendor-top"><span>{v.name.charAt(0)}</span><div><strong>{v.name}</strong><small>{v.availability||"Ketersediaan belum dicatat"}</small></div><button onClick={()=>toggleShortlist(v.id)}>{v.shortlisted?"♥":"♡"}</button></div><div className="vendor-contact"><span>{v.contact||"Kontak belum tersedia"}</span><span>{v.social||"Sosial media belum tersedia"}</span></div><div className="package-summary"><strong>{v.packages.length} paket</strong><span>{harga.length?`Mulai ${money(Math.min(...harga))}`:"Harga belum tercatat"}</span></div><button className="link-button" onClick={()=>setExpanded(expanded===v.id?null:v.id)}>{expanded===v.id?"Tutup detail":"Lihat paket lengkap →"}</button>{expanded===v.id&&<div className="package-list">{v.packages.map((p,i)=><div key={i}><strong>{p.name}</strong><span>Owner: {p.ownerPrice?money(p.ownerPrice):"-"} · Team: {p.teamPrice?money(p.teamPrice):"-"}</span><small>{p.includes.join(" · ")||"Tidak ada rincian"}</small></div>)}</div>}</article>;})}</div></>;
}

function PreweddingView({data,patchData,notify}) {
  const[q,setQ]=useState("");const[sort,setSort]=useState("name");
  const locations=[...data.preweddingLocations].filter(x=>x.name.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>sort==="price"?a.price-b.price:a.name.localeCompare(b.name));
  const toggle=(id)=>{patchData("preweddingLocations",data.preweddingLocations.map(x=>x.id===id?{...x,shortlisted:!x.shortlisted}:x));notify("Pilihan lokasi diperbarui")};
  const photos=data.assets.filter(a=>a.sheet==="Prewedding");
  return <><PageIntro kicker={`${data.preweddingLocations.length} REFERENSI LOKASI`} title="Perencanaan prewedding" text="Bandingkan biaya lokasi dan simpan tempat favorit untuk dibahas bersama."/><div className="prewed-feature">{photos.map(asset=><img key={asset.src} src={asset.src} alt="Referensi prewedding dari Excel"/>)}<div><span>SHORTLIST</span><strong>{data.preweddingLocations.filter(x=>x.shortlisted).length} lokasi dipilih</strong><p>Gunakan ikon hati untuk menyimpan kandidat lokasi.</p></div></div><div className="list-toolbar"><input placeholder="Cari lokasi..." value={q} onChange={e=>setQ(e.target.value)}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="name">Urutkan nama</option><option value="price">Harga termurah</option></select></div><div className="location-grid">{locations.map(location=><article key={location.id} className={location.shortlisted?"selected":""}><button onClick={()=>toggle(location.id)}>{location.shortlisted?"♥":"♡"}</button><span>LOKASI</span><strong>{location.name}</strong><b>{money(location.price)}</b><small>{location.note||"Tidak ada catatan tambahan"}</small></article>)}</div></>;
}

function GuestsView({data,patchData,notify}) {
  const empty={name:"",owner:OWNER_OPTIONS[0],priority:"Prioritas",pax:1,rsvp:"Menunggu"};const[form,setForm]=useState(empty);const[modal,setModal]=useState(false);const[editing,setEditing]=useState(null);const[owner,setOwner]=useState("all");
  const list=data.guests.filter(x=>owner==="all"||x.owner===owner);const total=sum(data.guests,"pax");
  const open=item=>{setEditing(item?.id||null);setForm(item?{...item}:{...empty});setModal(true)};
  const save=e=>{e.preventDefault();const record={...form,id:editing||uid("guest"),pax:Number(form.pax)};patchData("guests",editing?data.guests.map(x=>x.id===editing?record:x):[...data.guests,record]);setForm(empty);setEditing(null);setModal(false);notify(editing?"Tamu diperbarui":"Tamu ditambahkan")};
  const remove=id=>{if(confirm("Hapus tamu ini dari daftar undangan?")){patchData("guests",data.guests.filter(x=>x.id!==id));notify("Tamu dihapus")}};
  return <><PageIntro kicker="EMPAT KELOMPOK UNDANGAN" title="Daftar tamu" text="Kelola prioritas, jumlah orang, pemilik undangan, serta konfirmasi kehadiran." action={<button className="main-button" onClick={()=>open()}>＋ Tambah tamu</button>}/><div className="metric-grid"><Metric label="Total Tamu" value={`${total} orang`} tone="green"/><Metric label="Konfirmasi Hadir" value={`${sum(data.guests.filter(x=>x.rsvp==="Hadir"),"pax")} orang`}/><Metric label="Menunggu RSVP" value={`${sum(data.guests.filter(x=>x.rsvp==="Menunggu"),"pax")} orang`}/><Metric label="Jumlah Entri" value={`${data.guests.length} undangan`}/></div><div className="owner-tabs"><button className={owner==="all"?"active":""} onClick={()=>setOwner("all")}>Semua</button>{OWNER_OPTIONS.map(x=><button key={x} className={owner===x?"active":""} onClick={()=>setOwner(x)}>{x}</button>)}</div><section className="workspace-card guest-table"><div className="table-head"><span>Nama</span><span>Pemilik undangan</span><span>Prioritas</span><span>Pax</span><span>RSVP</span><span/></div>{list.length?list.map(item=><div className="table-row" key={item.id}><strong>{item.name}</strong><span>{item.owner}</span><em className="pill">{item.priority}</em><span>{item.pax}</span><select value={item.rsvp} onChange={e=>patchData("guests",data.guests.map(x=>x.id===item.id?{...x,rsvp:e.target.value}:x))}><option>Menunggu</option><option>Hadir</option><option>Tidak Hadir</option></select><div className="row-actions"><button onClick={()=>open(item)}>Edit</button><button onClick={()=>remove(item.id)}>Hapus</button></div></div>):<Empty text="Excel belum berisi nama tamu. Gunakan tombol Tambah Tamu untuk memulai."/>}</section>{modal&&<Modal title={editing?"Edit Tamu":"Tambah Tamu"} onClose={()=>setModal(false)}><form className="editor-form" onSubmit={save}><Field wide label="Nama tamu"><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field><Field label="Pemilik undangan"><select value={form.owner} onChange={e=>setForm({...form,owner:e.target.value})}>{OWNER_OPTIONS.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Prioritas"><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Prioritas</option><option>Ingin diundang</option><option>Cadangan</option></select></Field><Field label="Jumlah orang"><input type="number" min="1" value={form.pax} onChange={e=>setForm({...form,pax:e.target.value})}/></Field><Field label="RSVP"><select value={form.rsvp} onChange={e=>setForm({...form,rsvp:e.target.value})}><option>Menunggu</option><option>Hadir</option><option>Tidak Hadir</option></select></Field><FormActions onCancel={()=>setModal(false)}/></form></Modal>}</>;
}

function PreparationsView({data,patchData,notify}) {
  const empty={box:"",item:"",vendor:"",price:"",done:false};const[tab,setTab]=useState("offerings");const[modal,setModal]=useState(false);const[editing,setEditing]=useState(null);const[form,setForm]=useState(empty);
  const kunci=()=>tab==="offerings"?"offerings":"souvenirs";
  const daftar=()=>tab==="offerings"?data.offerings:data.souvenirs;
  const open=item=>{setEditing(item?.id||null);setForm(item?{...empty,...item}:{...empty});setModal(true)};
  const save=e=>{e.preventDefault();const list=daftar();const record=tab==="offerings"?{...form,id:editing||uid("offering"),price:Number(form.price)}:{...form,id:editing||uid("souvenir"),price:Number(form.price),link:form.link||""};patchData(kunci(),editing?list.map(x=>x.id===editing?record:x):[...list,record]);setModal(false);setForm(empty);setEditing(null);notify(editing?"Item diperbarui":"Item ditambahkan")};
  const remove=id=>{if(confirm("Hapus item ini?")){patchData(kunci(),daftar().filter(x=>x.id!==id));notify("Item dihapus")}};
  return <><PageIntro kicker="SOUVENIR & SESERAHAN" title="Detail perlengkapan" text="Kelola isi setiap box, vendor, biaya, dan status pembelian." action={<button className="main-button" onClick={()=>open()}>＋ Tambah item</button>}/><div className="owner-tabs"><button className={tab==="offerings"?"active":""} onClick={()=>setTab("offerings")}>Seserahan ({data.offerings.length})</button><button className={tab==="souvenirs"?"active":""} onClick={()=>setTab("souvenirs")}>Souvenir ({data.souvenirs.length})</button></div>{tab==="offerings"?<div className="box-grid">{data.offerings.map(item=><article key={item.id} className={item.done?"complete":""}><button className="check-button" onClick={()=>patchData("offerings",data.offerings.map(x=>x.id===item.id?{...x,done:!x.done}:x))}>{item.done?"✓":""}</button><span>{item.box||"Tanpa box"}</span><strong>{item.item||"Item belum diisi"}</strong><small>{item.vendor||"Vendor belum dipilih"}</small><b>{money(item.price)}</b><div className="row-actions"><button onClick={()=>open(item)}>Edit</button><button onClick={()=>remove(item.id)}>Hapus</button></div></article>)}</div>:<section className="workspace-card simple-list">{data.souvenirs.map(item=><article key={item.id}><div><strong>{item.item||item.vendor||"Item souvenir"}</strong><small>{item.vendor}</small></div><b>{money(item.price)}</b><div className="row-actions">{item.link&&<a href={item.link} target="_blank" rel="noreferrer">Buka ↗</a>}<button onClick={()=>open(item)}>Edit</button><button onClick={()=>remove(item.id)}>Hapus</button></div></article>)}</section>}{modal&&<Modal title={`${editing?"Edit":"Tambah"} ${tab==="offerings"?"Seserahan":"Souvenir"}`} onClose={()=>setModal(false)}><form className="editor-form" onSubmit={save}>{tab==="offerings"&&<Field label="Box"><input value={form.box} onChange={e=>setForm({...form,box:e.target.value})}/></Field>}<Field label="Item"><input required value={form.item} onChange={e=>setForm({...form,item:e.target.value})}/></Field><Field label="Vendor"><input value={form.vendor} onChange={e=>setForm({...form,vendor:e.target.value})}/></Field><Field label="Harga"><input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></Field><FormActions onCancel={()=>setModal(false)}/></form></Modal>}</>;
}

function DocumentsView({data,patchData,notify}) {
  const empty={requirement:"",note:"",link:"",done:false};const[form,setForm]=useState(empty);const[modal,setModal]=useState(false);const[editing,setEditing]=useState(null);const done=data.documents.filter(x=>x.done).length;
  const open=item=>{setEditing(item?.id||null);setForm(item?{...item}:{...empty});setModal(true)};
  const save=e=>{e.preventDefault();const record={...form,id:editing||uid("document")};patchData("documents",editing?data.documents.map(x=>x.id===editing?record:x):[...data.documents,record]);setModal(false);setForm(empty);setEditing(null);notify(editing?"Dokumen diperbarui":"Dokumen ditambahkan")};
  const remove=id=>{if(confirm("Hapus dokumen ini?")){patchData("documents",data.documents.filter(x=>x.id!==id));notify("Dokumen dihapus")}};
  return <><PageIntro kicker="ADMINISTRASI PERNIKAHAN" title="Dokumen & persyaratan" text="Checklist administrasi yang diekstrak dari workbook beserta catatan dan tautannya." action={<button className="main-button" onClick={()=>open()}>＋ Tambah dokumen</button>}/><div className="document-progress"><div><strong>{done}/{data.documents.length}</strong><span>dokumen siap</span></div><div className="big-progress"><span style={{width:`${data.documents.length?done/data.documents.length*100:0}%`}}/></div></div><section className="workspace-card document-list">{data.documents.map(item=><article key={item.id} className={item.done?"is-done":""}><button className="check-button" onClick={()=>patchData("documents",data.documents.map(x=>x.id===item.id?{...x,done:!x.done}:x))}>{item.done?"✓":""}</button><div><strong>{item.requirement}</strong><small>{item.note||"Tidak ada catatan"}</small></div><div className="row-actions">{item.link&&<a href={item.link} target="_blank" rel="noreferrer">Buka ↗</a>}<button onClick={()=>open(item)}>Edit</button><button onClick={()=>remove(item.id)}>Hapus</button></div></article>)}</section>{modal&&<Modal title={editing?"Edit Dokumen":"Tambah Dokumen"} onClose={()=>setModal(false)}><form className="editor-form" onSubmit={save}><Field wide label="Nama dokumen"><input required value={form.requirement} onChange={e=>setForm({...form,requirement:e.target.value})}/></Field><Field wide label="Catatan"><textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></Field><Field wide label="Tautan"><input type="url" value={form.link} onChange={e=>setForm({...form,link:e.target.value})}/></Field><FormActions onCancel={()=>setModal(false)}/></form></Modal>}</>;
}

function MoodboardView({data}) {
  const moodAssets=data.assets.filter(x=>["Mood Board","Prewedding","Hiasan","Summary"].includes(x.sheet));
  const sections=data.moodNotes.filter(x=>x.text.length>2);
  return <><PageIntro kicker="REFERENSI VISUAL EXCEL" title="Mood board" text="Aset gambar dan seluruh catatan konsep dari workbook tersimpan di sini."/><div className="mood-layout"><section className="mood-gallery">{moodAssets.map((asset,index)=><figure key={asset.src} className={`mood-${index%5}`}><img src={asset.src} alt={`Referensi ${asset.sheet}`}/><figcaption>{asset.sheet} · {asset.column}{asset.row}</figcaption></figure>)}</section><aside className="workspace-card mood-notes"><CardHead kicker={`${sections.length} CATATAN`} title="Arahan Konsep"/>{sections.map((note,i)=><div key={`${note.cell}-${i}`}><span>{note.cell}</span><p>{note.text}</p></div>)}</aside></div></>;
}

function PageIntro({kicker,title,text,action}) { return <div className="page-intro"><div><span>{kicker}</span><h1>{title}</h1><p>{text}</p></div>{action}</div>; }
function Metric({label,value,note,tone}) { return <article className={`planner-metric ${tone||""}`}><span>{label}</span><strong>{value}</strong>{note&&<small>{note}</small>}</article>; }
function CardHead({kicker,title,action}) { return <div className="card-head"><div><span>{kicker}</span><h2>{title}</h2></div>{action&&<strong>{action}</strong>}</div>; }
function Field({label,wide,children}) { return <label className={`editor-field ${wide?"wide":""}`}><span>{label}</span>{children}</label>; }
function FormActions({onCancel}) { return <div className="form-actions"><button type="button" onClick={onCancel}>Batal</button><button type="submit">Simpan</button></div>; }
function Modal({title,onClose,children}) { return <div className="planner-modal-bg" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="planner-modal"><header><div><span>DEWASA AYU</span><h2>{title}</h2></div><button onClick={onClose}>×</button></header>{children}</section></div>; }
function Empty({text}) { return <div className="planner-empty"><span>♡</span><strong>Belum ada data</strong><p>{text}</p></div>; }
function sum(items,key) { return items.reduce((total,item)=>total+Number(item[key]||0),0); }
