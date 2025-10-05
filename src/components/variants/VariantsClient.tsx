// src\components\variants\VariantsClient.tsx
"use client";

import { useEffect, useState } from "react";
import { Menu, Plus, List, Pin, Trash2, CheckCircle, Gauge } from "lucide-react";
import { createVariant, deleteVariant, listVariants, updateVariant, variantsOverview } from "./api";

function CreateForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ name:"", heroTitle:"", heroSub:"", ctaText:"Book a Free Demo", ctaHref:"#contact", showCap:10 });
  const [saving, setSaving] = useState(false);
  return (
    <form className="max-w-xl grid gap-3" onSubmit={async e=>{
      e.preventDefault(); setSaving(true);
      try { await createVariant(form); onCreated(); setForm({ name:"", heroTitle:"", heroSub:"", ctaText:"Book a Free Demo", ctaHref:"#contact", showCap:10 }); }
      finally { setSaving(false); }
    }}>
      <input className="bg-black/40 border border-white/10 rounded-lg p-3" placeholder="Variant name" required value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
      <input className="bg-black/40 border border-white/10 rounded-lg p-3" placeholder="Hero H1" required value={form.heroTitle} onChange={e=>setForm({...form, heroTitle:e.target.value})}/>
      <input className="bg-black/40 border border-white/10 rounded-lg p-3" placeholder="Hero subheading" required value={form.heroSub} onChange={e=>setForm({...form, heroSub:e.target.value})}/>
      <div className="grid grid-cols-2 gap-3">
        <input className="bg-black/40 border border-white/10 rounded-lg p-3" placeholder="CTA text" value={form.ctaText} onChange={e=>setForm({...form, ctaText:e.target.value})}/>
        <input className="bg-black/40 border border-white/10 rounded-lg p-3" placeholder="CTA href" value={form.ctaHref} onChange={e=>setForm({...form, ctaHref:e.target.value})}/>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm opacity-80">Show cap (times)
          <input type="number" min={0} className="mt-1 w-full bg-black/40 border border-white/10 rounded-lg p-2" value={form.showCap} onChange={e=>setForm({...form, showCap: Number(e.target.value)})}/>
        </label>
      </div>
      <button disabled={saving} className="rounded-xl px-5 py-3 font-semibold bg-white text-black hover:bg-white/90">{saving?"Saving…":"Create Variant"}</button>
    </form>
  );
}

function ListVariants() {
  const [list, setList] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const refresh = async () => {
    const [l, a] = await Promise.all([listVariants(), variantsOverview()]);
    setList(l.variants); setAnalytics(a.variants);
  };
  useEffect(()=>{ void refresh(); }, []);

  const merged = list.map(v => {
    const a = analytics.find((x:any)=> String(x.variantId) === String(v._id)) || {};
    return { ...v, sessions: a.sessions??0, users: a.users??0, clicks: a.clicks??0, ctr: a.ctr??0, avgHero: a.avgHero??0, avgServices: a.avgServices??0, avgContact: a.avgContact??0 };
  });

  return (
    <div className="space-y-4">
      <div className="overflow-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="text-left opacity-70 bg-white/5">
            <tr>
              <th className="py-2 px-3">Name</th>
              <th>Impr.</th><th>Cap</th><th>Active</th><th>Pinned</th>
              <th>Sessions</th><th>Users</th><th>Clicks</th><th>CTR</th>
              <th>AvgHero</th><th>AvgServices</th><th>AvgContact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {merged.map(v=>(
              <tr key={v._id} className="border-t border-white/10">
                <td className="py-2 px-3">{v.name}</td>
                <td>{v.impressions}</td>
                <td>
                  <input type="number" min={0} className="w-20 bg-black/40 border border-white/10 rounded p-1"
                    defaultValue={v.showCap}
                    onBlur={async e=>{ await updateVariant(v._id, { showCap: Number(e.currentTarget.value) }); await refresh(); }} />
                </td>
                <td><button className="text-xs border border-white/20 rounded px-2 py-1 hover:bg-white/10"
                      onClick={async ()=>{ await updateVariant(v._id, { active: !v.active }); await refresh(); }}>
                      {v.active ? "On" : "Off"}</button></td>
                <td><button className="text-xs border border-white/20 rounded px-2 py-1 hover:bg-white/10"
                      onClick={async ()=>{ await updateVariant(v._id, { pinned: !v.pinned }); await refresh(); }}>
                      {v.pinned ? "Pinned" : "Pin"}</button></td>
                <td>{v.sessions}</td>
                <td>{v.users}</td>
                <td>{v.clicks}</td>
                <td>{(v.ctr*100).toFixed(1)}%</td>
                <td>{Math.round(v.avgHero)}</td>
                <td>{Math.round(v.avgServices)}</td>
                <td>{Math.round(v.avgContact)}</td>
                <td className="space-x-2">
                  <button title="Keep long (pin)" onClick={async ()=>{ await updateVariant(v._id, { pinned: true, active: true }); await refresh(); }} className="inline-flex items-center gap-1 text-xs border border-white/20 rounded px-2 py-1 hover:bg-white/10"><Pin size={14}/>Keep</button>
                  <button title="Maximise show time" onClick={async ()=>{ await updateVariant(v._id, { showCap: 1_000_000 }); await refresh(); }} className="inline-flex items-center gap-1 text-xs border border-white/20 rounded px-2 py-1 hover:bg-white/10"><Gauge size={14}/>Max</button>
                  <button title="Delete" onClick={async ()=>{ if(confirm("Delete variant?")) { await deleteVariant(v._id); await refresh(); } }} className="inline-flex items-center gap-1 text-xs border border-red-400/40 text-red-300 rounded px-2 py-1 hover:bg-red-500/10"><Trash2 size={14}/>Del</button>
                </td>
              </tr>
            ))}
            {merged.length===0 && <tr><td colSpan={13} className="py-4 text-center opacity-60">No variants yet</td></tr>}
          </tbody>
        </table>
      </div>
      <button onClick={refresh} className="rounded-xl px-4 py-2 border border-white/20 hover:bg-white/10 inline-flex items-center gap-2"><CheckCircle size={16}/>Refresh</button>
    </div>
  );
}

export default function VariantsClient(){
  const [open,setOpen]=useState(true);
  const [tab,setTab]=useState<"create"|"all">("create");

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100 flex">
      <aside className={`transition-all border-r border-white/10 bg-black/40 ${open ? "w-64":"w-14"}`}>
        <div className="flex items-center justify-between px-3 py-3 border-b border-white/10">
          <button onClick={()=>setOpen(v=>!v)} className="p-2 rounded hover:bg-white/10"><Menu size={18}/></button>
          {open && <span className="text-sm opacity-80">Variants</span>}
        </div>
        <nav className="py-2">
          <button onClick={()=>setTab("create")} className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 ${tab==="create"?"bg-white/10":""}`}><Plus size={18}/>{open && "Create variant"}</button>
          <button onClick={()=>setTab("all")} className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 ${tab==="all"?"bg-white/10":""}`}><List size={18}/>{open && "All variants"}</button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-6">
        {tab==="create" && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm mb-3 opacity-80">Create Variant</div>
            <CreateForm onCreated={()=>{ /* nothing; list tab can refresh itself */ }} />
          </div>
        )}
        {tab==="all" && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm mb-3 opacity-80">Manage Variants</div>
            <ListVariants />
          </div>
        )}
      </main>
    </div>
  );
}
