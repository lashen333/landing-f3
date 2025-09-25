// src\components\dashboard\OverviewPanel.tsx
"use client";

import type { Overview } from "./useAnalytics";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

export default function OverviewPanel({ overview }: { overview: Overview | null }) {
  if (!overview) return <p className="opacity-70">Loading overview…</p>;
  const cards = [
    { label: "Sessions", value: overview.totals.sessions },
    { label: "Unique Users (IP)", value: overview.totals.uniqueUsers },
    { label: "Active Users (30m)", value: overview.totals.activeUsers30m },
    { label: "CTA Clicks", value: overview.totals.ctaClicks },
  ];

  const timeData = (overview.charts?.avgTimeBySection ?? []).map(d => ({ section: d.section, seconds: Math.round(d.avgSeconds) }));
  const deviceData = overview.charts?.deviceBreakdown ?? [];
  const sourceData = overview.charts?.sourceBreakdown ?? [];
  const geoTop = overview.charts?.geoTop ?? [];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs opacity-70">{c.label}</div>
            <div className="text-2xl font-semibold mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm mb-2 opacity-80">Avg Time by Section (s)</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={timeData}>
                <XAxis dataKey="section" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="seconds" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm mb-2 opacity-80">Devices</div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={deviceData} dataKey="count" nameKey="label" outerRadius={90} label />
                {deviceData.map((_, i) => <Cell key={i} />)}
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm mb-2 opacity-80">Sources</div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={sourceData} dataKey="count" nameKey="label" outerRadius={90} label />
                {sourceData.map((_, i) => <Cell key={i} />)}
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm mb-2 opacity-80">Top Locations</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left opacity-70">
              <tr><th className="py-2">Location</th><th>Sessions</th></tr>
            </thead>
            <tbody>
              {geoTop.map((g) => (
                <tr key={g.location} className="border-t border-white/10">
                  <td className="py-2">{g.location}</td>
                  <td>{g.count}</td>
                </tr>
              ))}
              {geoTop.length === 0 && <tr><td className="py-3 opacity-60" colSpan={2}>No data yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs opacity-60">Updated at {new Date(overview.updatedAt).toLocaleTimeString()}</div>
    </div>
  );
}
