// src\components\dashboard\CampaignsPanel.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { fetchCampaignsOverview, fetchCampaignDetail, type CampaignRow } from "./campaigns/useCampaigns";

export default function CampaignsPanel() {
  const [rows, setRows] = useState<CampaignRow[]>([]);
  const [bySource, setBySource] = useState<{ source: string; sessions: number; users: number; ctaClicks: number; ctr: number }[]>([]);
  const [selected, setSelected] = useState<{ source: string; campaign: string } | null>(null);
  const [detail, setDetail] = useState<null | Awaited<ReturnType<typeof fetchCampaignDetail>>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const o = await fetchCampaignsOverview();
        setRows(o.rows);
        setBySource(o.bySource);
      } catch (e) {
        console.warn(e);
      } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!selected) return;
      try {
        const d = await fetchCampaignDetail(selected.source, selected.campaign);
        setDetail(d);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, [selected]);

  const bestPlatform = useMemo(() => {
    if (!bySource.length) return null;
    // define “best” by CTR first, tie-breaker sessions
    return [...bySource].sort((a,b) => (b.ctr - a.ctr) || (b.sessions - a.sessions))[0];
  }, [bySource]);

  const winningCampaign = useMemo(() => {
    if (!rows.length) return null;
    // define “winning” by CTR, tie-breaker clicks then sessions
    return [...rows].sort((a,b) => (b.ctr - a.ctr) || (b.ctaClicks - a.ctaClicks) || (b.sessions - a.sessions))[0];
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs opacity-70">Best Platform</div>
          <div className="text-lg font-semibold mt-1">{bestPlatform ? bestPlatform.source : "—"}</div>
          {bestPlatform && <div className="text-xs opacity-70 mt-1">CTR {(bestPlatform.ctr*100).toFixed(1)}% • Sessions {bestPlatform.sessions}</div>}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs opacity-70">Winning Campaign</div>
          <div className="text-lg font-semibold mt-1">{winningCampaign ? `${winningCampaign.source} / ${winningCampaign.campaign}` : "—"}</div>
          {winningCampaign && <div className="text-xs opacity-70 mt-1">CTR {(winningCampaign.ctr*100).toFixed(1)}% • Clicks {winningCampaign.ctaClicks}</div>}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs opacity-70">Total Campaigns</div>
          <div className="text-2xl font-semibold mt-1">{rows.length}</div>
        </div>
      </div>

      {/* Platform performance */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm mb-2 opacity-80">Sessions by Platform</div>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={bySource}>
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaign leaderboard */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm mb-2 opacity-80">Campaign Leaderboard</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left opacity-70">
              <tr>
                <th className="py-2">Platform</th>
                <th>Campaign</th>
                <th>Sessions</th>
                <th>Users (IP)</th>
                <th>Clicks</th>
                <th>CTR</th>
                <th>Avg Sec / Session</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={`${r.source}|${r.campaign}`} className="border-t border-white/10 hover:bg-white/5 cursor-pointer"
                    onClick={() => setSelected({ source: r.source, campaign: r.campaign })}>
                  <td className="py-2">{r.source}</td>
                  <td className="truncate max-w-[240px]" title={r.campaign}>{r.campaign}</td>
                  <td>{r.sessions}</td>
                  <td>{r.users}</td>
                  <td>{r.ctaClicks}</td>
                  <td>{(r.ctr*100).toFixed(1)}%</td>
                  <td>{Math.round(r.avgTimePerSession)}</td>
                </tr>
              ))}
              {!rows.length && !loading && <tr><td colSpan={7} className="py-3 opacity-60">No campaign data yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail drawer-like card */}
      {selected && detail && detail.head && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm opacity-80">
              Detail: <span className="font-semibold">{detail.head.source}</span> / <span className="font-semibold">{detail.head.campaign}</span>
            </div>
            <button className="text-xs px-2 py-1 border border-white/20 rounded hover:bg-white/10" onClick={() => { setSelected(null); setDetail(null); }}>Close</button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mt-4">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm mb-2 opacity-80">Avg Time by Section (s)</div>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={[
                    { section: "hero", sec: Math.round(detail.head.avgHero) },
                    { section: "services", sec: Math.round(detail.head.avgServices) },
                    { section: "contact", sec: Math.round(detail.head.avgContact) },
                  ]}>
                    <XAxis dataKey="section" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sec" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm mb-2 opacity-80">Devices</div>
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={detail.devices} dataKey="count" nameKey="label" outerRadius={90} label />
                    {detail.devices.map((_, i) => <Cell key={i} />)}
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm mb-2 opacity-80">Top Geo</div>
              <div className="overflow-auto h-64">
                <table className="w-full text-sm">
                  <thead className="text-left opacity-70">
                    <tr><th className="py-2">Location</th><th>Sessions</th><th>Users</th></tr>
                  </thead>
                  <tbody>
                    {detail.geo.map(g => (
                      <tr key={g.location} className="border-t border-white/10">
                        <td className="py-2">{g.location}</td>
                        <td>{g.sessions}</td>
                        <td>{g.uniqueUsers}</td>
                      </tr>
                    ))}
                    {!detail.geo.length && <tr><td colSpan={3} className="py-3 opacity-60">No geo data</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="text-xs opacity-60 mt-3">
            Sessions {detail.head.sessions} • Users {detail.head.users} • Clicks {detail.head.ctaClicks} • CTR {(detail.head.ctr*100).toFixed(1)}% • Avg {Math.round(detail.head.avgTimePerSession)}s
          </div>
        </div>
      )}
    </div>
  );
}
