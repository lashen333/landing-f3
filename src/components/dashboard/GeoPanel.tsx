// src\components\dashboard\GeoPanel.tsx
"use client";

export default function GeoPanel({
  data,
}: { data: { location: string; sessions: number; uniqueUsers: number }[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm mb-2 opacity-80">Geo (by session & unique IP)</div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left opacity-70">
            <tr><th className="py-2">Location</th><th>Sessions</th><th>Unique Users</th></tr>
          </thead>
          <tbody>
            {data.map((g) => (
              <tr key={g.location} className="border-t border-white/10">
                <td className="py-2">{g.location}</td>
                <td>{g.sessions}</td>
                <td>{g.uniqueUsers}</td>
              </tr>
            ))}
            {data.length === 0 && <tr><td className="py-3 opacity-60" colSpan={3}>No data yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
