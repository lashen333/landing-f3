"use client";

import { useEffect, useRef } from "react";
import type { LandingVariant } from "@/types/variant";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Accept unknown JSON and narrow it ourselves (no `any`)
type AssignRes = { ok: boolean; variant: unknown };

function asLandingVariant(x: unknown): LandingVariant | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  return {
    _id: String(o._id ?? ""),
    name: String(o.name ?? ""),
    heroTitle: String(o.heroTitle ?? ""),
    heroSub: typeof o.heroSub === "string" ? o.heroSub : null,
    ctaText: String(o.ctaText ?? ""),
    ctaHref: String(o.ctaHref ?? ""),
  };
}

export default function VariantLoader({
  onLoaded,
  disabled = false,
}: {
  onLoaded: (v: LandingVariant | null) => void;
  disabled?: boolean;
}) {
  // keep a stable reference to the callback
  const onLoadedRef = useRef(onLoaded);
  useEffect(() => {
    onLoadedRef.current = onLoaded;
  }, [onLoaded]);

  useEffect(() => {
    if (disabled) return;

    let cancelled = false;

    // ensure we have a session id
    let sid = sessionStorage.getItem("sid");
    if (!sid) {
      sid = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
      sessionStorage.setItem("sid", sid);
    }

    // Pre-seed from cache
    try {
      const cached = sessionStorage.getItem("variant");
      if (cached && !cancelled) {
        const parsed: unknown = JSON.parse(cached);
        onLoadedRef.current(asLandingVariant(parsed));
      }
    } catch {
      /* ignore cache parse errors */
    }

    const params = new URLSearchParams(window.location.search);
    const forceName = params.get("variant") || undefined;

    (async () => {
      try {
        const res = await fetch(`${API}/api/variants/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sid, forceName }),
          cache: "no-store",
          keepalive: true,
        });

        if (!res.ok) throw new Error(await res.text());

        const json = (await res.json()) as AssignRes;
        const variant = asLandingVariant(json.variant);

        if (cancelled) return;

        if (variant) {
          sessionStorage.setItem("variant", JSON.stringify(variant));
          sessionStorage.setItem("variant_ready", "1");
        } else {
          sessionStorage.removeItem("variant");
          sessionStorage.removeItem("variant_ready");
        }

        onLoadedRef.current(variant);
      } catch {
        if (!cancelled) onLoadedRef.current(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [disabled]);

  return null;
}
