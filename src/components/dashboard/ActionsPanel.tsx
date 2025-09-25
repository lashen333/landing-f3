// src\components\dashboard\ActionsPanel.tsx
"use client";

export default function ActionsPanel({ data }: { data: any[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm mb-4 opacity-80">Recent Actions</div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left opacity-70">
            <tr><th className="py-2">Time</th><th>Session</th><th>Section</th><th>Event</th><th>Time Spent</th></tr>
          </thead>
          <tbody>
            {data.map((a, idx) => (
              <tr key={idx} className="border-t border-white/10">
                <td className="py-2">{a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : "-"}</td>
                <td className="truncate max-w-[160px]" title={a.sessionId}>{a.sessionId}</td>
                <td>{a.section}</td>
                <td>{a.event}</td>
                <td>{a.timeSpent ?? "-"}</td>
              </tr>
            ))}
            {data.length === 0 && <tr><td className="py-3 opacity-60" colSpan={5}>No data yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
