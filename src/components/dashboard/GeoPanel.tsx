// src/components/dashboard/GeoPanel.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import GeoChoropleth from "./GeoChoropleth";
import GeoLeaflet from "./GeoLeaflet";
import { fetchGeoPoints } from "./useAnalytics";

type TableRow = { location: string; sessions: number; uniqueUsers: number };
type Point = { country?: string; city?: string; lat: number; lon: number; sessions: number; users: number };
type CountryRow = { country: string; sessions: number; users: number };

export default function GeoPanel({ data }: { data: TableRow[] }) {
  const [tab, setTab] = useState<"table" | "map">("map");
  const [view, setView] = useState<"choropleth" | "bubbles">("choropleth");
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetchGeoPoints();
        setPoints(r.points);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  // Aggregate points → countries for the choropleth
  const countries: CountryRow[] = useMemo(() => {
    const byCountry = new Map<string, { sessions: number; users: number }>();
    for (const p of points) {
      const key = (p.country?.trim() || "Unknown").toUpperCase();
      const prev = byCountry.get(key) ?? { sessions: 0, users: 0 };
      byCountry.set(key, {
        sessions: prev.sessions + (p.sessions || 0),
        users: prev.users + (p.users || 0),
      });
    }
    return Array.from(byCountry.entries()).map(([country, agg]) => ({
      country,
      sessions: agg.sessions,
      users: agg.users,
    }));
  }, [points]);

  return (
    <div className="space-y-4">
      {/* Top-level tab: Map vs Table */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab("map")}
          className={`text-xs px-3 py-1 rounded border ${
            tab === "map" ? "bg-white text-black border-white" : "border-white/20 hover:bg-white/10"
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setTab("table")}
          className={`text-xs px-3 py-1 rounded border ${
            tab === "table" ? "bg-white text-black border-white" : "border-white/20 hover:bg-white/10"
          }`}
        >
          Table
        </button>
      </div>

      {tab === "map" && (
        <div className="space-y-3">
          {/* Sub-toggle: Choropleth vs Bubbles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("choropleth")}
              className={`text-xs px-3 py-1 rounded border ${
                view === "choropleth" ? "bg-white text-black border-white" : "border-white/20 hover:bg-white/10"
              }`}
            >
              Choropleth
            </button>
            <button
              onClick={() => setView("bubbles")}
              className={`text-xs px-3 py-1 rounded border ${
                view === "bubbles" ? "bg-white text-black border-white" : "border-white/20 hover:bg-white/10"
              }`}
            >
              Bubbles
            </button>
          </div>

          <div className="rounded-xl border border-white/10 overflow-hidden" style={{ height: 420 }}>
            {view === "choropleth" && <GeoChoropleth countries={countries} />}
            {view === "bubbles" && <GeoLeaflet points={points} />}
          </div>
        </div>
      )}

      {tab === "table" && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm mb-2 opacity-80">Geo (by session & unique IP)</div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left opacity-70">
                <tr>
                  <th className="py-2">Location</th>
                  <th>Sessions</th>
                  <th>Unique Users</th>
                </tr>
              </thead>
              <tbody>
                {data.map((g) => (
                  <tr key={g.location} className="border-t border-white/10">
                    <td className="py-2">{g.location}</td>
                    <td>{g.sessions}</td>
                    <td>{g.uniqueUsers}</td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td className="py-3 opacity-60" colSpan={3}>
                      No data yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
