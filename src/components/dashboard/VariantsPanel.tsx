// src\components\dashboard\VariantsPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { variantsOverview } from "@/components/variants/api";
import { updateVariant } from "@/components/variants/api";

export default function VariantsPanel(){
  const [rows,setRows]=useState<any[]>([]);
  const load = async ()=>{ const r = await variantsOverview(); setRows(r.variants); };
  useEffect(()=>{ void load(); }, []);

  return (
    <div className="space-y-4">
      <div className="overflow-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="text-left opacity-70 bg-white/5">
            <tr>
              <th className="py-2 px-3">Variant</th>
              <th>Impr.</th><th>Cap</th><th>Active</th><th>Pinned</th>
              <th>Sessions</th><th>Users</th><th>Clicks</th><th>CTR</th>
              <th>AvgHero</th><th>AvgServices</th><th>AvgContact</th>
              <th>Keep</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(v=>(
              <tr key={String(v.variantId)} className="border-t border-white/10">
                <td className="py-2 px-3">{v.name}</td>
                <td>{v.impressions}</td>
                <td>{v.showCap}</td>
                <td>{v.active ? "On" : "Off"}</td>
                <td>{v.pinned ? "Yes" : "No"}</td>
                <td>{v.sessions}</td>
                <td>{v.users}</td>
                <td>{v.clicks}</td>
                <td>{(v.ctr*100).toFixed(1)}%</td>
                <td>{Math.round(v.avgHero)}</td>
                <td>{Math.round(v.avgServices)}</td>
                <td>{Math.round(v.avgContact)}</td>
                <td>
                  <button className="text-xs border border-white/20 rounded px-2 py-1 hover:bg-white/10"
                    onClick={async ()=>{ await updateVariant(String(v.variantId), { pinned: true, active: true }); await load(); }}>
                    Keep Long
                  </button>
                </td>
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan={13} className="py-3 opacity-60 text-center">No variant data yet</td></tr>}
          </tbody>
        </table>
      </div>
      <button onClick={load} className="text-xs px-3 py-2 border border-white/20 rounded hover:bg-white/10">Refresh</button>
    </div>
  );
}
