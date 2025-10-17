// src\components\dashboard\GeoChoropleth.tsx
"use client";

import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

// Lightweight world topojson (no API key)
const WORLD = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export type CountryRow = {
  code?: string;       // ISO-2, e.g. "US", "LK"
  sessions: number;    // total sessions in range
  users: number;       // unique users (by IP) in range
};

type Props = {
  countries: CountryRow[];
  metric?: "sessions" | "users"; // color by which metric (default: sessions)
};

export default function GeoChoropleth({ countries, metric = "sessions" }: Props) {
  const [hover, setHover] = useState<string | null>(null);

  // Map ISO-2 => data row
  const byCode = useMemo(() => {
    const m = new Map<string, CountryRow>();
    for (const c of countries) if (c.code) m.set(c.code.toUpperCase(), c);
    return m;
  }, [countries]);

  // Scale for color (sqrt for better distribution)
  const maxValue = useMemo(
    () => Math.max(1, ...countries.map(c => (metric === "sessions" ? c.sessions : c.users))),
    [countries, metric]
  );

  const fillFor = (value: number) => {
    // Dark → Bright grayscale (tweakable)
    const t = Math.sqrt(value / maxValue);        // 0..1
    const v = Math.floor(30 + t * 190);           // 30..220
    return `rgb(${v},${v},${Math.floor(v * 1.05)})`;
  };

  return (
    <div className="relative w-full h-[520px] rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <ComposableMap projectionConfig={{ scale: 140 }}>
        <Geographies geography={WORLD}>
          {({ geographies }) =>
            geographies.map((geo) => {
              // Many topojsons expose ISO_A2 / ISO_A2_EH; we normalize to upper
              
              const code = (geo.properties.ISO_A2 || geo.properties.ISO_A2_EH || "").toUpperCase();
              const name = geo.properties.NAME || geo.properties.name || "";
              const row = code ? byCode.get(code) : undefined;
              const value = row ? (metric === "sessions" ? row.sessions : row.users) : 0;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() =>
                    setHover(
                      row
                        ? `${name} (${code}) • ${metric === "sessions" ? "Sessions" : "Users"} ${value}`
                        : name || code
                    )
                  }
                  onMouseLeave={() => setHover(null)}
                  style={{
                    default: {
                      fill: row ? fillFor(value) : "#0b0f1a",
                      stroke: "rgba(255,255,255,0.08)",
                      outline: "none",
                    },
                    hover: {
                      fill: row ? fillFor(value) : "#0e1422",
                      stroke: "rgba(255,255,255,0.25)",
                      outline: "none",
                    },
                    pressed: {
                      fill: row ? fillFor(value) : "#0e1422",
                      stroke: "rgba(255,255,255,0.35)",
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Tooltip */}
      {hover && (
        <div className="absolute bottom-3 left-3 text-xs px-2 py-1 rounded bg-black/70 border border-white/10 pointer-events-none">
          {hover}
        </div>
      )}

      {/* Legend */}
      <Legend metric={metric} />
    </div>
  );
}

function Legend({ metric }: { metric: "sessions" | "users" }) {
  return (
    <div className="absolute top-3 right-3 text-[10px] bg-black/60 border border-white/10 rounded px-2 py-1 shadow">
      <div className="mb-1 text-[10px] uppercase opacity-80">Intensity: {metric}</div>
      <div className="flex items-center gap-1">
        <span
          className="inline-block w-3 h-3 rounded"
          style={{ background: "rgb(30,30,32)" }}
        />
        <span className="opacity-70">low</span>
        <span className="mx-1 opacity-40">→</span>
        <span
          className="inline-block w-3 h-3 rounded"
          style={{ background: "rgb(220,220,231)" }}
        />
        <span className="opacity-70">high</span>
      </div>
    </div>
  );
}
