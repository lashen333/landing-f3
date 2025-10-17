// src\components\dashboard\GeoLeaflet.tsx
"use client";

import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import L from "leaflet"; // ← import Leaflet core

type Point = {
  lat: number;
  lon: number;
  city?: string;
  countryCode?: string;
  sessions: number;
  users: number;
};

// Custom icon (you can swap URL for another)
const locationIcon = new L.Icon({
  iconUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const makeSvgIcon = (hex: string) => {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
    <path fill="${hex}" d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41C12.5 41 25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z"/>
    <circle cx="12.5" cy="12.5" r="5.5" fill="white"/>
  </svg>`;
  return new L.Icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
};

export default function GeoLeaflet({ points }: { points: Point[] }) {
  const data = useMemo(
    () => points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon)),
    [points]
  );

  return (
    <div className="h-[560px] w-full rounded-xl overflow-hidden border border-white/10">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        worldCopyJump
        style={{ height: "100%", width: "100%", background: "#0b0f1a" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {data.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lon]} icon={makeSvgIcon("#FF5733")}>
            <Tooltip direction="top" offset={[0, -6]} opacity={0.9}>
              <div className="text-xs">
                {(p.city ? p.city + ", " : "") + (p.countryCode ?? "")}
                <br />
                Sessions {p.sessions} • Users {p.users}
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
