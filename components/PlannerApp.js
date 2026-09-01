"use client";

import { useEffect, useMemo, useState } from "react";
import initialData from "../data/wedding-data.json";

const STORE_KEY = "dewasa-ayu-planner-v2";
const NAV = [
  ["dashboard", "⌂", "Ringkasan"], ["budget", "◉", "Anggaran"],
  ["expenses", "↗", "Pengeluaran"], ["checklist", "✓", "Checklist"],
  ["vendors", "♢", "Vendor MUA"], ["prewedding", "◎", "Prewedding"],
  ["guests", "♡", "Daftar Tamu"], ["preparations", "□", "Seserahan"],
  ["documents", "▤", "Dokumen"], ["moodboard", "✦", "Mood Board"]
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

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY));
      if (saved?.meta && saved?.project) setData(saved);
    } catch (_) {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(STORE_KEY, JSON.stringify(data)); }, [data, ready]);
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
        <div className="planner-content">
          {view === "dashboard" && <DashboardView {...props} onNavigate={setView} />}
          {view === "budget" && <BudgetView {...props} />}
          {view === "expenses" && <ExpensesView {...props} />}
          {view === "checklist" && <ChecklistView {...props} />}
          {view === "vendors" && <VendorView {...props} />}
          {view === "prewedding" && <PreweddingView {...props} />}
          {view === "guests" && <GuestsView {...props} />}
          {view === "preparations" && <PreparationsView {...props} />}
          {view === "documents" && <DocumentsView {...props} />}
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
      <Metric label="Total Sumber Dana" value={shortMoney(funding)} note="5 kontributor" tone="green" />
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
    <section className="workspace-card budget-table-card"><CardHead kicker="17 KATEGORI DARI EXCEL" title="Alokasi dan Realisasi" action={money(allocation)} /><div className="data-table budget-table"><div className="table-head"><span>Kategori</span><span>Alokasi</span><span>Aktual</span><span>Selisih</span><span>Progres</span></div>{data.categories.map((category) => { const actual=spentByCategory[category.name]||0; const ratio=category.allocation?actual/category.allocation*100:actual?100:0; return <div className="table-row" key={category.id}><strong>{category.name}</strong><label className="money-cell">Rp <input type="number" value={category.allocation} onChange={(e)=>updateCategory(category.id,e.target.value)} /></label><span>{money(actual)}</span><span className={category.allocation-actual<0?"negative":"positive-text"}>{money(category.allocation-actual)}</span><div className="row-progress"><i style={{width:`${Math.min(ratio,100)}%`}} /><small>{Math.round(ratio)}%</small></div></div>})}</div></section>
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

function ChecklistView({data,patchData,notify}) {
  const empty={task:"",status:"BELUM",done:false,vendor:"",dueDate:"",notes:""}; const [form,setForm]=useState(empty);const[modal,setModal]=useState(false);const[filter,setFilter]=useState("all");
  const items=data.checklist.filter(x=>filter==="all"||(filter==="done"?x.done:!x.done));
  const toggle=(id)=>patchData("checklist",data.checklist.map(x=>x.id===id?{...x,done:!x.done,status:!x.done?"DONE":"BELUM"}:x));
  const save=(e)=>{e.preventDefault();patchData("checklist",[...data.checklist,{...form,id:uid("task"),done:form.status==="DONE"}]);setModal(false);setForm(empty);notify("Tugas ditambahkan")};
  return <><PageIntro kicker="38 TUGAS DARI EXCEL" title="Checklist persiapan" text="Tentukan status, vendor, tenggat, dan catatan untuk setiap pekerjaan." action={<button className="main-button" onClick={()=>setModal(true)}>＋ Tambah tugas</button>} />
    <div className="check-summary"><button className={filter==="all"?"active":""} onClick={()=>setFilter("all")}><strong>{data.checklist.length}</strong><span>Semua</span></button><button className={filter==="todo"?"active":""} onClick={()=>setFilter("todo")}><strong>{data.checklist.filter(x=>!x.done).length}</strong><span>Belum selesai</span></button><button className={filter==="done"?"active":""} onClick={()=>setFilter("done")}><strong>{data.checklist.filter(x=>x.done).length}</strong><span>Selesai</span></button></div>
    <section className="workspace-card checklist-list">{items.map(item=><article key={item.id} className={item.done?"is-done":""}><button className="check-button" onClick={()=>toggle(item.id)}>{item.done?"✓":""}</button><div><strong>{item.task}</strong><small>{item.vendor||"Vendor belum dipilih"}{item.notes?` · ${item.notes}`:""}</small></div><select value={item.status} onChange={e=>patchData("checklist",data.checklist.map(x=>x.id===item.id?{...x,status:e.target.value,done:e.target.value==="DONE"}:x))}><option>BELUM</option><option>ON PROCESS</option><option>DONE</option></select><time className={item.dueDate&&new Date(item.dueDate)<new Date()&&!item.done?"late":""}>{item.dueDate?prettyDate(item.dueDate):"Tanpa tenggat"}</time></article>)}</section>
    {modal&&<Modal title="Tambah Checklist" onClose={()=>setModal(false)}><form onSubmit={save} className="editor-form"><Field wide label="Nama tugas"><input required value={form.task} onChange={e=>setForm({...form,task:e.target.value})}/></Field><Field label="Status"><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>BELUM</option><option>ON PROCESS</option><option>DONE</option></select></Field><Field label="Tenggat"><input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></Field><Field label="Vendor"><input value={form.vendor} onChange={e=>setForm({...form,vendor:e.target.value})}/></Field><Field label="Catatan"><input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></Field><FormActions onCancel={()=>setModal(false)}/></form></Modal>}
  </>;
}

function VendorView({data,patchData,notify}) {
  const[query,setQuery]=useState(""); const [expanded,setExpanded]=useState(null);
  const list=data.muaVendors.filter(v=>v.name.toLowerCase().includes(query.toLowerCase()));
  const toggleShortlist=(id)=>{patchData("muaVendors",data.muaVendors.map(v=>v.id===id?{...v,shortlisted:!v.shortlisted}:v));notify("Shortlist vendor diperbarui")};
  return <><PageIntro kicker="DATABASE EXCEL" title="Vendor Make Up Artist" text={`${data.muaVendors.length} vendor lengkap dengan paket, harga owner/team, kontak, dan cakupan layanan.`}/><div className="list-toolbar solo"><input placeholder="Cari nama vendor..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="vendor-grid">{list.map(v=><article className={`vendor-card ${v.shortlisted?"selected":""}`} key={v.id}><div className="vendor-top"><span>{v.name.charAt(0)}</span><div><strong>{v.name}</strong><small>{v.availability||"Ketersediaan belum dicatat"}</small></div><button onClick={()=>toggleShortlist(v.id)}>{v.shortlisted?"♥":"♡"}</button></div><div className="vendor-contact"><span>{v.contact||"Kontak belum tersedia"}</span><span>{v.social||"Sosial media belum tersedia"}</span></div><div className="package-summary"><strong>{v.packages.length} paket</strong><span>Mulai {money(Math.min(...v.packages.map(p=>p.ownerPrice||p.teamPrice).filter(Boolean)))}</span></div><button className="link-button" onClick={()=>setExpanded(expanded===v.id?null:v.id)}>{expanded===v.id?"Tutup detail":"Lihat paket lengkap →"}</button>{expanded===v.id&&<div className="package-list">{v.packages.map((p,i)=><div key={i}><strong>{p.name}</strong><span>Owner: {p.ownerPrice?money(p.ownerPrice):"-"} · Team: {p.teamPrice?money(p.teamPrice):"-"}</span><small>{p.includes.join(" · ")||"Tidak ada rincian"}</small></div>)}</div>}</article>)}</div></>;
}

function PreweddingView({data,patchData,notify}) {
  const[q,setQ]=useState("");const[sort,setSort]=useState("name");
  const locations=[...data.preweddingLocations].filter(x=>x.name.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>sort==="price"?a.price-b.price:a.name.localeCompare(b.name));
  const toggle=(id)=>{patchData("preweddingLocations",data.preweddingLocations.map(x=>x.id===id?{...x,shortlisted:!x.shortlisted}:x));notify("Pilihan lokasi diperbarui")};
  const photos=data.assets.filter(a=>a.sheet==="Prewedding");
  return <><PageIntro kicker="66 REFERENSI LOKASI" title="Perencanaan prewedding" text="Bandingkan biaya lokasi dan simpan tempat favorit untuk dibahas bersama."/><div className="prewed-feature">{photos.map(asset=><img key={asset.src} src={asset.src} alt="Referensi prewedding dari Excel"/>)}<div><span>SHORTLIST</span><strong>{data.preweddingLocations.filter(x=>x.shortlisted).length} lokasi dipilih</strong><p>Gunakan ikon hati untuk menyimpan kandidat lokasi.</p></div></div><div className="list-toolbar"><input placeholder="Cari lokasi..." value={q} onChange={e=>setQ(e.target.value)}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="name">Urutkan nama</option><option value="price">Harga termurah</option></select></div><div className="location-grid">{locations.map(location=><article key={location.id} className={location.shortlisted?"selected":""}><button onClick={()=>toggle(location.id)}>{location.shortlisted?"♥":"♡"}</button><span>LOKASI</span><strong>{location.name}</strong><b>{money(location.price)}</b><small>{location.note||"Tidak ada catatan tambahan"}</small></article>)}</div></>;
}

function GuestsView({data,patchData,notify}) {
  const empty={name:"",owner:OWNER_OPTIONS[0],priority:"Prioritas",pax:1,rsvp:"Menunggu"};const[form,setForm]=useState(empty);const[modal,setModal]=useState(false);const[owner,setOwner]=useState("all");
  const list=data.guests.filter(x=>owner==="all"||x.owner===owner);const total=sum(data.guests,"pax");
  const save=e=>{e.preventDefault();patchData("guests",[...data.guests,{...form,id:uid("guest"),pax:Number(form.pax)}]);setForm(empty);setModal(false);notify("Tamu ditambahkan")};
  const remove=id=>patchData("guests",data.guests.filter(x=>x.id!==id));
  return <><PageIntro kicker="EMPAT KELOMPOK UNDANGAN" title="Daftar tamu" text="Kelola prioritas, jumlah orang, pemilik undangan, serta konfirmasi kehadiran." action={<button className="main-button" onClick={()=>setModal(true)}>＋ Tambah tamu</button>}/><div className="metric-grid"><Metric label="Total Tamu" value={`${total} orang`} tone="green"/><Metric label="Konfirmasi Hadir" value={`${sum(data.guests.filter(x=>x.rsvp==="Hadir"),"pax")} orang`}/><Metric label="Menunggu RSVP" value={`${sum(data.guests.filter(x=>x.rsvp==="Menunggu"),"pax")} orang`}/><Metric label="Jumlah Entri" value={`${data.guests.length} undangan`}/></div><div className="owner-tabs"><button className={owner==="all"?"active":""} onClick={()=>setOwner("all")}>Semua</button>{OWNER_OPTIONS.map(x=><button key={x} className={owner===x?"active":""} onClick={()=>setOwner(x)}>{x}</button>)}</div><section className="workspace-card guest-table"><div className="table-head"><span>Nama</span><span>Pemilik undangan</span><span>Prioritas</span><span>Pax</span><span>RSVP</span><span/></div>{list.length?list.map(item=><div className="table-row" key={item.id}><strong>{item.name}</strong><span>{item.owner}</span><em className="pill">{item.priority}</em><span>{item.pax}</span><select value={item.rsvp} onChange={e=>patchData("guests",data.guests.map(x=>x.id===item.id?{...x,rsvp:e.target.value}:x))}><option>Menunggu</option><option>Hadir</option><option>Tidak Hadir</option></select><button className="delete-x" onClick={()=>remove(item.id)}>×</button></div>):<Empty text="Excel belum berisi nama tamu. Gunakan tombol Tambah Tamu untuk memulai."/>}</section>{modal&&<Modal title="Tambah Tamu" onClose={()=>setModal(false)}><form className="editor-form" onSubmit={save}><Field wide label="Nama tamu"><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field><Field label="Pemilik undangan"><select value={form.owner} onChange={e=>setForm({...form,owner:e.target.value})}>{OWNER_OPTIONS.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Prioritas"><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Prioritas</option><option>Ingin diundang</option><option>Cadangan</option></select></Field><Field label="Jumlah orang"><input type="number" min="1" value={form.pax} onChange={e=>setForm({...form,pax:e.target.value})}/></Field><Field label="RSVP"><select value={form.rsvp} onChange={e=>setForm({...form,rsvp:e.target.value})}><option>Menunggu</option><option>Hadir</option><option>Tidak Hadir</option></select></Field><FormActions onCancel={()=>setModal(false)}/></form></Modal>}</>;
}

function PreparationsView({data,patchData,notify}) {
  const[tab,setTab]=useState("offerings");const[modal,setModal]=useState(false);const[form,setForm]=useState({box:"",item:"",vendor:"",price:"",done:false});
  const save=e=>{e.preventDefault();if(tab==="offerings")patchData("offerings",[...data.offerings,{...form,id:uid("offering"),price:Number(form.price)}]);else patchData("souvenirs",[...data.souvenirs,{id:uid("souvenir"),vendor:form.vendor,item:form.item,price:Number(form.price),link:""}]);setModal(false);notify("Data persiapan ditambahkan")};
  return <><PageIntro kicker="SOUVENIR & SESERAHAN" title="Detail perlengkapan" text="Kelola isi setiap box, vendor, biaya, dan status pembelian." action={<button className="main-button" onClick={()=>setModal(true)}>＋ Tambah item</button>}/><div className="owner-tabs"><button className={tab==="offerings"?"active":""} onClick={()=>setTab("offerings")}>Seserahan ({data.offerings.length})</button><button className={tab==="souvenirs"?"active":""} onClick={()=>setTab("souvenirs")}>Souvenir ({data.souvenirs.length})</button></div>{tab==="offerings"?<div className="box-grid">{data.offerings.map(item=><article key={item.id} className={item.done?"complete":""}><button className="check-button" onClick={()=>patchData("offerings",data.offerings.map(x=>x.id===item.id?{...x,done:!x.done}:x))}>{item.done?"✓":""}</button><span>{item.box||"Tanpa box"}</span><strong>{item.item||"Item belum diisi"}</strong><small>{item.vendor||"Vendor belum dipilih"}</small><b>{money(item.price)}</b></article>)}</div>:<section className="workspace-card simple-list">{data.souvenirs.map(item=><article key={item.id}><div><strong>{item.item||item.vendor||"Item souvenir"}</strong><small>{item.vendor}</small></div><b>{money(item.price)}</b>{item.link&&<a href={item.link} target="_blank" rel="noreferrer">Buka link</a>}</article>)}</section>}{modal&&<Modal title={`Tambah ${tab==="offerings"?"Seserahan":"Souvenir"}`} onClose={()=>setModal(false)}><form className="editor-form" onSubmit={save}>{tab==="offerings"&&<Field label="Box"><input value={form.box} onChange={e=>setForm({...form,box:e.target.value})}/></Field>}<Field label="Item"><input required value={form.item} onChange={e=>setForm({...form,item:e.target.value})}/></Field><Field label="Vendor"><input value={form.vendor} onChange={e=>setForm({...form,vendor:e.target.value})}/></Field><Field label="Harga"><input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></Field><FormActions onCancel={()=>setModal(false)}/></form></Modal>}</>;
}

function DocumentsView({data,patchData,notify}) {
  const[form,setForm]=useState({requirement:"",note:"",link:"",done:false});const[modal,setModal]=useState(false);const done=data.documents.filter(x=>x.done).length;
  const save=e=>{e.preventDefault();patchData("documents",[...data.documents,{...form,id:uid("document")}]);setModal(false);notify("Dokumen ditambahkan")};
  return <><PageIntro kicker="ADMINISTRASI PERNIKAHAN" title="Dokumen & persyaratan" text="Checklist administrasi yang diekstrak dari workbook beserta catatan dan tautannya." action={<button className="main-button" onClick={()=>setModal(true)}>＋ Tambah dokumen</button>}/><div className="document-progress"><div><strong>{done}/{data.documents.length}</strong><span>dokumen siap</span></div><div className="big-progress"><span style={{width:`${data.documents.length?done/data.documents.length*100:0}%`}}/></div></div><section className="workspace-card document-list">{data.documents.map(item=><article key={item.id} className={item.done?"is-done":""}><button className="check-button" onClick={()=>patchData("documents",data.documents.map(x=>x.id===item.id?{...x,done:!x.done}:x))}>{item.done?"✓":""}</button><div><strong>{item.requirement}</strong><small>{item.note||"Tidak ada catatan"}</small></div>{item.link&&<a href={item.link} target="_blank" rel="noreferrer">Buka referensi ↗</a>}</article>)}</section>{modal&&<Modal title="Tambah Dokumen" onClose={()=>setModal(false)}><form className="editor-form" onSubmit={save}><Field wide label="Nama dokumen"><input required value={form.requirement} onChange={e=>setForm({...form,requirement:e.target.value})}/></Field><Field wide label="Catatan"><textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></Field><Field wide label="Tautan"><input type="url" value={form.link} onChange={e=>setForm({...form,link:e.target.value})}/></Field><FormActions onCancel={()=>setModal(false)}/></form></Modal>}</>;
}

function MoodboardView({data}) {
  const moodAssets=data.assets.filter(x=>["Mood Board","Prewedding","Hiasan","Summary"].includes(x.sheet));
  const sections=data.moodNotes.filter(x=>x.text.length>2);
  return <><PageIntro kicker="REFERENSI VISUAL EXCEL" title="Mood board" text="Aset gambar dan seluruh catatan konsep dari workbook tersimpan di sini."/><div className="mood-layout"><section className="mood-gallery">{moodAssets.map((asset,index)=><figure key={asset.src} className={`mood-${index%5}`}><img src={asset.src} alt={`Referensi ${asset.sheet}`}/><figcaption>{asset.sheet} · {asset.column}{asset.row}</figcaption></figure>)}</section><aside className="workspace-card mood-notes"><CardHead kicker="46 CATATAN" title="Arahan Konsep"/>{sections.map((note,i)=><div key={`${note.cell}-${i}`}><span>{note.cell}</span><p>{note.text}</p></div>)}</aside></div></>;
}

function PageIntro({kicker,title,text,action}) { return <div className="page-intro"><div><span>{kicker}</span><h1>{title}</h1><p>{text}</p></div>{action}</div>; }
function Metric({label,value,note,tone}) { return <article className={`planner-metric ${tone||""}`}><span>{label}</span><strong>{value}</strong>{note&&<small>{note}</small>}</article>; }
function CardHead({kicker,title,action}) { return <div className="card-head"><div><span>{kicker}</span><h2>{title}</h2></div>{action&&<strong>{action}</strong>}</div>; }
function Field({label,wide,children}) { return <label className={`editor-field ${wide?"wide":""}`}><span>{label}</span>{children}</label>; }
function FormActions({onCancel}) { return <div className="form-actions"><button type="button" onClick={onCancel}>Batal</button><button type="submit">Simpan</button></div>; }
function Modal({title,onClose,children}) { return <div className="planner-modal-bg" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="planner-modal"><header><div><span>DEWASA AYU</span><h2>{title}</h2></div><button onClick={onClose}>×</button></header>{children}</section></div>; }
function Empty({text}) { return <div className="planner-empty"><span>♡</span><strong>Belum ada data</strong><p>{text}</p></div>; }
function sum(items,key) { return items.reduce((total,item)=>total+Number(item[key]||0),0); }
