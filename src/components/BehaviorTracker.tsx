// src/components/BehaviorTracker.tsx
"use client";

import { useEffect, useRef } from "react";

/* ---- stable section ids + types ---- */
const OBSERVED_IDS = ["hero", "services", "contact"] as const;
type SectionId = typeof OBSERVED_IDS[number];
const isObserved = (id: string): id is SectionId =>
  (OBSERVED_IDS as readonly string[]).includes(id);

/* ---- events ---- */
type ActionInput = {
  section: SectionId;
  event: "CTA_Click" | "SectionEnter" | "SectionExit" | "SectionTime" | "Scrolled" | "ReachedEnd";
  timeSpent?: number;
  timestamp?: string;
};

/* ---- SSR-safe session id ---- */
function getSessionIdSafe(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let sid = window.sessionStorage.getItem("sid");
    if (!sid) {
      sid = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
      window.sessionStorage.setItem("sid", sid);
    }
    return sid;
  } catch {
    return null;
  }
}

async function postActions(sessionId: string, actions: ActionInput[]) {
  const API = process.env.NEXT_PUBLIC_API_URL ;
  try {
    const res = await fetch(`${API}/api/sessions/${encodeURIComponent(sessionId)}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actions }),
      keepalive: true,
    });
    if (!res.ok) console.warn("postActions failed", await res.text());
  } catch (e) {
    console.warn("postActions error", e);
  }
}

export default function BehaviorTracker() {
  const sessionIdRef = useRef<string | null>(null);
  const enterTimeRef = useRef<Partial<Record<SectionId, number>>>({});
  const visibleRef = useRef<Set<SectionId>>(new Set());

  useEffect(() => {
    const sid = getSessionIdSafe();
    if (!sid) return;
    sessionIdRef.current = sid;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).id || "";
          if (!isObserved(id)) return; // ignore anything we don't track
          const sectionId = id; // narrowed to SectionId

          if (entry.isIntersecting) {
            visibleRef.current.add(sectionId);
            enterTimeRef.current[sectionId] = Date.now();
          } else if (visibleRef.current.has(sectionId)) {
            visibleRef.current.delete(sectionId);
            const started = enterTimeRef.current[sectionId];
            if (started) {
              const secs = Math.max(0, Math.round((Date.now() - started) / 1000));
              delete enterTimeRef.current[sectionId];
              postNow([{ section: sectionId, event: "SectionTime", timeSpent: secs, timestamp: new Date().toISOString() }]);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe sections
    OBSERVED_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // CTA click tracking (hero)
    const cta = document.querySelector('[data-cta="hero-cta"]');
    const onCta = () => {
      const started = enterTimeRef.current["hero"];
      const timeSpent = started ? Math.max(0, Math.round((Date.now() - started) / 1000)) : undefined;
      postNow([{ section: "hero", event: "CTA_Click", timeSpent, timestamp: new Date().toISOString() }]);
    };
    cta?.addEventListener("click", onCta);

    // Flush on unload
    const onUnload = () => {
      const pending: ActionInput[] = [];
      for (const sectionId of Array.from(visibleRef.current)) {
        const started = enterTimeRef.current[sectionId];
        if (started) {
          const secs = Math.max(0, Math.round((Date.now() - started) / 1000));
          pending.push({ section: sectionId, event: "SectionTime", timeSpent: secs, timestamp: new Date().toISOString() });
        }
      }
      if (pending.length && typeof navigator !== "undefined" && navigator.sendBeacon) {
        const url =
          (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") +
          `/api/sessions/${encodeURIComponent(sessionIdRef.current!)}/actions`;
        navigator.sendBeacon(url, new Blob([JSON.stringify({ actions: pending })], { type: "application/json" }));
      }
    };
    window.addEventListener("pagehide", onUnload);
    window.addEventListener("beforeunload", onUnload);

    function postNow(actions: ActionInput[]) {
      const sidNow = sessionIdRef.current;
      if (sidNow) postActions(sidNow, actions);
    }

    return () => {
      observer.disconnect();
      cta?.removeEventListener("click", onCta);
      window.removeEventListener("pagehide", onUnload);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, []); // ✅ no observedIds dependency

  return null;
}
