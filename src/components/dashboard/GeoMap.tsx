// src/components/dashboard/GeoMap.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type {
  FeatureCollection,
  Feature,
  Geometry,
  GeoJsonProperties,
} from "geojson";
import type {
  Topology,
  GeometryCollection,
} from "topojson-specification";
import world110m from "world-atlas/countries-110m.json";

export type GeoPoint = {
  country?: string;
  city?: string;
  lat: number;
  lon: number;
  sessions: number;
  users: number;
};

type World110m = Topology<{
  countries: GeometryCollection<GeoJsonProperties>;
}>;

const VIEW_W = 960;
const VIEW_H = 520;

export default function GeoMap({ points }: { points: GeoPoint[] }) {
  // 1) Filter invalid points
  const filtered = useMemo(
    () => points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon)),
    [points]
  );

  // 2) Bubble size (sqrt scale)
  const maxS = Math.max(1, ...filtered.map((d) => d.sessions));
  const r = (s: number) => 2 + 10 * Math.sqrt(s / maxS);

  // 3) Countries: TopoJSON -> GeoJSON, fully typed
  const countries = useMemo(() => {
    const topo = world110m as unknown as World110m;

    // Because “object” is a GeometryCollection, feature(...) returns a FeatureCollection
    const fc = feature(
      topo as Topology, // topology
      topo.objects.countries as GeometryCollection<GeoJsonProperties> // object
    ) as FeatureCollection<Geometry, GeoJsonProperties>;

    return fc.features as Feature<Geometry, GeoJsonProperties>[];
  }, []);

  // 4) Projection/path
  const projection = useMemo<GeoProjection>(() => {
    const p = geoNaturalEarth1();
    p.fitSize(
      [VIEW_W, VIEW_H],
      { type: "FeatureCollection", features: countries } as FeatureCollection<
        Geometry,
        GeoJsonProperties
      >
    );
    return p;
  }, [countries]);

  const path = useMemo(() => geoPath(projection), [projection]);

  // 5) Pan & zoom
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

  const svgPoint = (ev: { clientX: number; clientY: number }) => {
    const el = svgRef.current!;
    const rect = el.getBoundingClientRect();
    const mx = ((ev.clientX - rect.left) / rect.width) * VIEW_W;
    const my = ((ev.clientY - rect.top) / rect.height) * VIEW_H;
    return { mx, my };
  };

  const onWheel: React.WheelEventHandler<SVGSVGElement> = (e) => {
    e.preventDefault();
    const { mx, my } = svgPoint(e);
    const dir = e.deltaY > 0 ? 1 : -1;
    const factor = Math.pow(1.1, dir);
    const kNew = clamp(transform.k * factor, 0.8, 8);

    const { x, y, k } = transform;
    const xNew = mx - (mx - x) * (kNew / k);
    const yNew = my - (my - y) * (kNew / k);

    setTransform({ x: xNew, y: yNew, k: kNew });
  };

  const onMouseDown: React.MouseEventHandler<SVGSVGElement> = (e) => {
    dragRef.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove: React.MouseEventHandler<SVGSVGElement> = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current = { x: e.clientX, y: e.clientY };
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
  };
  const endDrag = () => (dragRef.current = null);

  // 6) Tooltip
  const [tooltip, setTooltip] = useState<string | null>(null);

  return (
    <div className="w-full h-[520px] rounded-xl border border-white/10 bg-white/5 overflow-hidden relative select-none">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseLeave={endDrag}
        onMouseUp={endDrag}
        style={{ touchAction: "none", cursor: dragRef.current ? "grabbing" : "grab" }}
      >
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {/* countries */}
          <g>
            {countries.map((c, i) => (
              <path
                key={String(c.id ?? i)}
                d={path(c)!}
                fill="#0b0f1a"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={0.5}
              />
            ))}
          </g>

          {/* markers */}
          <g>
            {filtered.map((p, i) => {
              const xy = projection([p.lon, p.lat]);
              if (!xy) return null;
              const [x, y] = xy;
              return (
                <g key={i} transform={`translate(${x},${y})`}>
                  <circle
                    r={r(p.sessions)}
                    onMouseEnter={() =>
                      setTooltip(
                        `${p.city ? p.city + ", " : ""}${p.country ?? ""} • Sessions ${p.sessions} • Users ${p.users}`
                      )
                    }
                    onMouseLeave={() => setTooltip(null)}
                    fill="rgba(255,255,255,0.9)"
                    opacity={0.75}
                    stroke="rgba(0,0,0,0.2)"
                    strokeWidth={1}
                  />
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {tooltip && (
        <div className="absolute bottom-3 left-3 text-xs px-2 py-1 rounded bg-black/70 border border-white/10">
          {tooltip}
        </div>
      )}
    </div>
  );
}
