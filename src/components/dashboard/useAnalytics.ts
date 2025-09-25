// src\components\dashboard\useAnalytics.ts
"use client";

import { useEffect, useRef, useState } from "react";

export type Overview = {
  ok: true;
  updatedAt: string;
  totals: { sessions: number; uniqueUsers: number; activeUsers30m: number; ctaClicks: number };
  charts?: {
    avgTimeBySection: { section: string; avgSeconds: number }[];
    deviceBreakdown: { label: string; count: number }[];
    sourceBreakdown: { label: string; count: number }[];
    geoTop: { location: string; count: number }[];
  };
};

                  
const API = process.env.NEXT_PUBLIC_API_URL;

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
  return res.json() as Promise<T>;
}

export function useAnalytics() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [geo, setGeo] = useState<{ ok: true; geo: { location: string; sessions: number; uniqueUsers: number }[] } | null>(null);
  const [devices, setDevices] = useState<{ ok: true; devices: { label: string; count: number }[] } | null>(null);
  const [actions, setActions] = useState<{ ok: true; actions: any[] } | null>(null);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    // initial fetch
    (async () => {
      try {
        const [o, g, d, a] = await Promise.all([
          getJSON<Overview>("/api/analytics/overview"),
          getJSON<{ ok: true; geo: { location: string; sessions: number; uniqueUsers: number }[] }>("/api/analytics/geo"),
          getJSON<{ ok: true; devices: { label: string; count: number }[] }>("/api/analytics/devices"),
          getJSON<{ ok: true; actions: any[] }>("/api/analytics/actions"),
        ]);
        setOverview(o); setGeo(g); setDevices(d); setActions(a);
      } catch (e) {
        console.warn("initial analytics fetch failed", e);
      }
    })();

    // SSE
    try {
      const es = new EventSource(`${API}/api/analytics/stream`);
      esRef.current = es;

      let opened = false; // avoid stale state in setTimeout

      es.onopen = () => { opened = true; setConnected(true); };

      es.addEventListener("overview", (ev) => {
        try {
          const data = JSON.parse((ev as MessageEvent).data);
          setOverview((prev) => ({ ...(prev ?? ({} as any)), ...data }));
        } catch {}
      });

      // fallback polling if SSE disconnects
      const startPoll = () => {
        if (pollRef.current) return;
        pollRef.current = window.setInterval(async () => {
          try {
            const o = await getJSON<Overview>("/api/analytics/overview");
            setOverview(o);
          } catch {}
        }, 5000);
      };

      // single onerror handler (don’t set it twice)
      es.onerror = () => {
        setConnected(false);
        try { es.close(); } catch {}
        startPoll();
      };

      // also start poll if SSE fails immediately to open
      setTimeout(() => {
        if (!opened) {
          try { es.close(); } catch {}
          startPoll();
        }
      }, 3000);

      return () => {
        try { es.close(); } catch {}
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      };
    } catch {
      // browsers without SSE: poll
      pollRef.current = window.setInterval(async () => {
        try {
          const o = await getJSON<Overview>("/api/analytics/overview");
          setOverview(o);
        } catch {}
      }, 5000);
      return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }
  }, []);

  const refreshTab = async (tab: "geo" | "devices" | "actions") => {
    if (tab === "geo") setGeo(await getJSON("/api/analytics/geo"));
    if (tab === "devices") setDevices(await getJSON("/api/analytics/devices"));
    if (tab === "actions") setActions(await getJSON("/api/analytics/actions"));
  };

  return { overview, geo, devices, actions, connected, refreshTab };
}
