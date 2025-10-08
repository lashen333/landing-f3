// src\components\dashboard\GeoMap.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
// TopoJSON -> convert to GeoJSON with topojson-client
import world110m from "world-atlas/countries-110m.json";

export type GeoPoint = {
  country?: string;
  city?: string;
  lat: number;
  lon: number;
  sessions: number;
  users: number;
};

// Internal: world-atlas json shape
type WorldTopo = {
  type: string;
  objects: { countries: any };
  arcs: any[];
  transform: any;
};

const VIEW_W = 960;
const VIEW_H = 520;

export default function GeoMap({ points }: { points: GeoPoint[] }) {
  // filter invalid points
  const filtered = useMemo(
    () => points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon)),
    [points]
  );

  // sqrt-sized bubbles
  const maxS = Math.max(1, ...filtered.map((d) => d.sessions));
  const r = (s: number) => 2 + 10 * Math.sqrt(s / maxS);

  // Countries as GeoJSON
  const countries = useMemo(() => {
  // 1) Type the Topology shape from world-atlas
  type World110m = Topology<{ countries: GeometryCollection }>;
  const topo = world110m as unknown as World110m;

  // 2) Convert TopoJSON -> GeoJSON
  // feature() returns a union; go via `unknown` to the concrete FeatureCollection we know it is.
  const fc = feature(
    topo as unknown as Topology,                       // topology
    topo.objects.countries as unknown as GeometryCollection // object within topology
  ) as unknown as FeatureCollection<Geometry, any>;

  // 3) Return the list of country features
  return fc.features as Feature<Geometry, any>[];
}, []);
  // Projection + path
  const projection = useMemo<GeoProjection>(() => {
    const p = geoNaturalEarth1();
    p.fitSize([VIEW_W, VIEW_H], {
      type: "FeatureCollection",
      features: countries,
    } as any);
    return p;
  }, [countries]);

  const path = useMemo(() => geoPath(projection), [projection]);

  // ---- pan & zoom ----
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

  // tooltip
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
        {/* pan/zoom container */}
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
