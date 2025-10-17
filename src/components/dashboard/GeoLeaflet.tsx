// src\components\dashboard\GeoLeaflet.tsx
"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";

type Point = { lat: number; lon: number; city?: string; countryCode?: string; sessions: number; users: number };

export default function GeoLeaflet({ points }: { points: Point[] }) {
  const data = useMemo(() => points.filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lon)), [points]);
  const max = Math.max(1, ...data.map(d => d.sessions));
  const radius = (s: number) => 3 + 12 * Math.sqrt(s / max);

  return (
    <div className="h-[560px] w-full rounded-xl overflow-hidden border border-white/10">
      <MapContainer {...({ center: [20, 0], zoom: 2, minZoom: 2, worldCopyJump: true } )} style={{ height: "100%", width: "100%", background: "#0b0f1a" }}>
      <TileLayer {...({ attribution: '&copy; OpenStreetMap', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" } )} />
      {data.map((p, i) => (
          // @ts-ignore - react-leaflet CircleMarker radius prop may be missing from some typings
          <CircleMarker key={i} center={[p.lat, p.lon]} radius={radius(p.sessions)} pathOptions={{ color: "#fff", weight: 1, fillColor: "#fff", fillOpacity: 0.75 }}>
            <Tooltip {...{ direction: "top", offset: [0, -6], opacity: 0.9 }}>
              {(p.city ? p.city + ", " : "") + (p.countryCode ?? "")}<br />
              Sessions {p.sessions} • Users {p.users}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
