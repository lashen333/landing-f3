"use client";

import { useEffect, useState } from "react";
import GeoMap from "./GeoMap";
import { fetchGeoPoints } from "./useAnalytics";

export default function GeoPanel({
  data,
}: { data: { location: string; sessions: number; uniqueUsers: number }[] }) {
  const [tab, setTab] = useState<"table" | "map">("map");
  const [points, setPoints] = useState<{ country?: string; city?: string; lat: number; lon: number; sessions: number; users: number }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetchGeoPoints();
        setPoints(r.points);
      } catch { /* ignore */ }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={()=>setTab("map")} className={`text-xs px-3 py-1 rounded border ${tab==="map"?"bg-white text-black border-white":"border-white/20 hover:bg-white/10"}`}>Map</button>
        <button onClick={()=>setTab("table")} className={`text-xs px-3 py-1 rounded border ${tab==="table"?"bg-white text-black border-white":"border-white/20 hover:bg-white/10"}`}>Table</button>
      </div>

      {tab === "map" && <GeoMap points={points} />}

      {tab === "table" && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm mb-2 opacity-80">Geo (by session & unique IP)</div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left opacity-70">
                <tr><th className="py-2">Location</th><th>Sessions</th><th>Unique Users</th></tr>
              </thead>
              <tbody>
                {data.map((g) => (
                  <tr key={g.location} className="border-t border-white/10">
                    <td className="py-2">{g.location}</td>
                    <td>{g.sessions}</td>
                    <td>{g.uniqueUsers}</td>
                  </tr>
                ))}
                {data.length === 0 && <tr><td className="py-3 opacity-60" colSpan={3}>No data yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
