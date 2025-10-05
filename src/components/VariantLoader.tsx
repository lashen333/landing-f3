// src/components/VariantLoader.tsx
"use client";

import { useEffect, useRef } from "react";
import type { LandingVariant } from "@/types/variant";

// Keep API stable (prevents react-hooks/exhaustive-deps warning)
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type AssignRes = { ok: boolean; variant: LandingVariant | null };

function asLandingVariant(x: any): LandingVariant | null {
  if (!x) return null;
  return {
    _id: String(x._id),
    name: String(x.name),
    heroTitle: String(x.heroTitle),
    heroSub: x.heroSub ?? null,
    ctaText: String(x.ctaText),
    ctaHref: String(x.ctaHref),
  };
}

export default function VariantLoader({
  onLoaded,
  disabled = false,
}: {
  onLoaded: (v: LandingVariant | null) => void;
  disabled?: boolean;
}) {
  // ✅ keep a stable reference to the callback
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

    // Pre-seed from cache (use landing subset only)
    try {
      const cached = sessionStorage.getItem("variant");
      if (cached && !cancelled) {
        const parsed = JSON.parse(cached);
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

        // If server errors, fall back to null
        if (!res.ok) throw new Error(await res.text());

        const json = (await res.json()) as AssignRes;
        const variant = asLandingVariant(json?.variant);

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
