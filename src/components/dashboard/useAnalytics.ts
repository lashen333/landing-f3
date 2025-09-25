"use client";

import { useEffect, useRef, useState } from "react";

/* ---------- Shared types ---------- */

export type ActionEvent =
  | "CTA_Click"
  | "SectionEnter"
  | "SectionExit"
  | "SectionTime"
  | "Scrolled"
  | "ReachedEnd";

export type ActionRecord = {
  sessionId: string;
  section: string;
  event: ActionEvent;
  timeSpent?: number;
  timestamp?: string; // ISO string
};

export type LabelCount = { label: string; count: number };

export type Overview = {
  ok: true;
  updatedAt: string;
  totals: {
    sessions: number;
    uniqueUsers: number;
    activeUsers30m: number;
    ctaClicks: number;
  };
  charts?: {
    avgTimeBySection: { section: string; avgSeconds: number }[];
    deviceBreakdown: LabelCount[];
    sourceBreakdown: LabelCount[];
    geoTop: { location: string; count: number }[];
  };
};

type GeoResp = {
  ok: true;
  geo: { location: string; sessions: number; uniqueUsers: number }[];
};

type DevicesResp = {
  ok: true;
  devices: LabelCount[];
};

type ActionsResp = {
  ok: true;
  actions: ActionRecord[];
};

/* ---------- Fetch helper ---------- */

const API = process.env.NEXT_PUBLIC_API_URL;

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
  return (await res.json()) as T;
}

/* ---------- Hook ---------- */

export function useAnalytics() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [geo, setGeo] = useState<GeoResp | null>(null);
  const [devices, setDevices] = useState<DevicesResp | null>(null);
  const [actions, setActions] = useState<ActionsResp | null>(null);
  const [connected, setConnected] = useState(false);

  const esRef = useRef<EventSource | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    // initial fetch
    (async () => {
      try {
        const [o, g, d, a] = await Promise.all([
          getJSON<Overview>("/api/analytics/overview"),
          getJSON<GeoResp>("/api/analytics/geo"),
          getJSON<DevicesResp>("/api/analytics/devices"),
          getJSON<ActionsResp>("/api/analytics/actions"),
        ]);
        setOverview(o);
        setGeo(g);
        setDevices(d);
        setActions(a);
      } catch (e) {
        console.warn("initial analytics fetch failed", e);
      }
    })();

    // SSE
    try {
      const es = new EventSource(`${API}/api/analytics/stream`);
      esRef.current = es;

      let opened = false;

      es.onopen = () => {
        opened = true;
        setConnected(true);
      };

      // Expect the server to send an "overview" event whose data serializes a partial Overview
      es.addEventListener("overview", (ev: MessageEvent<string>) => {
        try {
          const data = JSON.parse(ev.data) as Partial<Overview>;
          setOverview((prev) => ({ ...(prev ?? ({} as Overview)), ...(data as Overview) }));
        } catch {
          /* ignore parse errors */
        }
      });

      const startPoll = () => {
        if (pollRef.current) return;
        pollRef.current = window.setInterval(async () => {
          try {
            const o = await getJSON<Overview>("/api/analytics/overview");
            setOverview(o);
          } catch {
            /* ignore */
          }
        }, 5000);
      };

      es.onerror = () => {
        setConnected(false);
        try {
          es.close();
        } catch {
          /* ignore */
        }
        startPoll();
      };

      setTimeout(() => {
        if (!opened) {
          try {
            es.close();
          } catch {
            /* ignore */
          }
          startPoll();
        }
      }, 3000);

      return () => {
        try {
          es.close();
        } catch {
          /* ignore */
        }
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };
    } catch {
      // browsers without SSE: poll
      pollRef.current = window.setInterval(async () => {
        try {
          const o = await getJSON<Overview>("/api/analytics/overview");
          setOverview(o);
        } catch {
          /* ignore */
        }
      }, 5000);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, []);

  const refreshTab = async (tab: "geo" | "devices" | "actions") => {
    if (tab === "geo") setGeo(await getJSON<GeoResp>("/api/analytics/geo"));
    if (tab === "devices") setDevices(await getJSON<DevicesResp>("/api/analytics/devices"));
    if (tab === "actions") setActions(await getJSON<ActionsResp>("/api/analytics/actions"));
  };

  return { overview, geo, devices, actions, connected, refreshTab };
}
