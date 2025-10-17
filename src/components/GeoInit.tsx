// src\components\GeoInit.tsx
"use client";

import { useEffect } from "react";

export default function GeoInit() {
  useEffect(() => {
    // avoid repeating in this tab
    if (sessionStorage.getItem("geo_done") === "1") return;

    const sid = sessionStorage.getItem("sid");
    if (!sid || !("geolocation" in navigator)) return;

    const API = process.env.NEXT_PUBLIC_API_URL ;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetch(`${API}/api/sessions/${encodeURIComponent(sid)}/geo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          keepalive: true,
        }).finally(() => {
          sessionStorage.setItem("geo_done", "1");
        });
      },
      () => {
        sessionStorage.setItem("geo_done", "1");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  return null;
}
