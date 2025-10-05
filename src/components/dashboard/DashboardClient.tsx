// src\components\dashboard\DashboardClient.tsx
"use client";

import { useState } from "react";
import { BarChart3, MapPin, MousePointerClick, Smartphone, Menu } from "lucide-react";
import { useAnalytics } from "./useAnalytics";
import OverviewPanel from "./OverviewPanel";
import GeoPanel from "./GeoPanel";
import DevicesPanel from "./DevicesPanel";
import ActionsPanel from "./ActionsPanel";
import CampaignsPanel from "./CampaignsPanel";
import VariantsPanel from "./VariantsPanel";

export default function DashboardClient() {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<"overview" | "geo" | "devices" | "actions" | "campaigns" | "variants">("overview");
  const { overview, geo, devices, actions, connected, refreshTab } = useAnalytics();


  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100 flex">
      {/* Sidebar */}
      <aside className={`transition-all border-r border-white/10 bg-black/40 ${open ? "w-64" : "w-14"}`}>
        <div className="flex items-center justify-between px-3 py-3 border-b border-white/10">
          <button onClick={() => setOpen((v) => !v)} className="p-2 rounded hover:bg-white/10"><Menu size={18} /></button>
          {open && <span className="text-sm opacity-80">Realtime {connected ? "●" : "○"}</span>}
        </div>
        <nav className="py-2">
          <button onClick={() => setTab("overview")} className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 ${tab === "overview" ? "bg-white/10" : ""}`}>
            <BarChart3 size={18} /> {open && "Overview"}
          </button>
          <button onClick={async () => { setTab("geo"); await refreshTab("geo"); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 ${tab === "geo" ? "bg-white/10" : ""}`}>
            <MapPin size={18} /> {open && "Geo"}
          </button>
          <button onClick={async () => { setTab("devices"); await refreshTab("devices"); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 ${tab === "devices" ? "bg-white/10" : ""}`}>
            <Smartphone size={18} /> {open && "Devices"}
          </button>
          <button onClick={async () => { setTab("actions"); await refreshTab("actions"); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 ${tab === "actions" ? "bg-white/10" : ""}`}>
            <MousePointerClick size={18} /> {open && "Actions"}
          </button>
          <button onClick={() => setTab("campaigns")} className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 ${tab === "campaigns" ? "bg-white/10" : ""}`}>
            {/* you can pick an icon you like; reuse BarChart3 or similar */}
            <BarChart3 size={18} /> {open && "Campaigns"}
          </button>
          <button onClick={() => setTab("variants")} className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 ${tab==="variants"?"bg-white/10":""}`}>
            <BarChart3 size={18}/> {open && "Variants"}
          </button>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 md:p-6">
        {tab === "overview" && <OverviewPanel overview={overview} />}
        {tab === "geo" && <GeoPanel data={geo?.geo ?? []} />}
        {tab === "devices" && <DevicesPanel data={devices?.devices ?? []} />}
        {tab === "actions" && <ActionsPanel data={actions?.actions ?? []} />}
        {tab === "campaigns" && <CampaignsPanel/>}
        {tab === "variants" && <VariantsPanel/>}
      </main>
    </div>
  );
}
