// src\components\VariantLoader.tsx
"use client";

import { useEffect, useRef } from "react";

type Variant = {
  _id: string; name: string; heroTitle: string; heroSub: string; ctaText: string; ctaHref: string;
};

export default function VariantLoader({
  onLoaded,
  disabled = false,
}: {
  onLoaded: (v: Variant | null) => void;
  disabled?: boolean;
}) {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // ✅ keep a stable reference to the callback
  const onLoadedRef = useRef(onLoaded);
  useEffect(() => { onLoadedRef.current = onLoaded; }, [onLoaded]);

  useEffect(() => {
    if (disabled) return;

    let sid = sessionStorage.getItem("sid");
    if (!sid) {
      sid = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
      sessionStorage.setItem("sid", sid);
    }

    // Pre-seed (for client navigations)
    try {
      const cached = sessionStorage.getItem("variant");
      if (cached) onLoadedRef.current(JSON.parse(cached));
    } catch {}

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
        const json = await res.json();
        const variant: Variant | null = json?.variant ?? null;

        if (variant) {
          sessionStorage.setItem("variant", JSON.stringify(variant));
          sessionStorage.setItem("variant_ready", "1");
        } else {
          sessionStorage.removeItem("variant");
          sessionStorage.removeItem("variant_ready");
        }

        onLoadedRef.current(variant); // ✅ call the stable ref
      } catch {
        onLoadedRef.current(null);
      }
    })();
  }, [disabled]); // ✅ only rerun if disabled flips

  return null;
}
