import { useEffect, useState } from "react";
import { apiGet, authHeader } from "../lib/api";

export function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [daysAhead, setDaysAhead] = useState(30);
  const [reportMonth, setReportMonth] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}`;
  });

  async function load() {
    setError(null);
    try {
      const res = await apiGet<{ data: any[] }>(`/api/alerts?daysAhead=${daysAhead}`);
      setAlerts(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function downloadPdf() {
    setError(null);
    try {
      const res = await fetch(
        `/api/reports/financial-health.pdf?month=${encodeURIComponent(reportMonth)}`,
        { method: "GET", headers: authHeader() },
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error?.message ?? "No se pudo generar el PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-slate-900">Alertas</div>
            <div className="text-sm text-slate-600">Semáforo de vencimientos.</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="h-9 w-[110px] rounded-xl border px-3 text-sm"
              type="number"
              value={daysAhead}
              onChange={(e) => setDaysAhead(Number(e.target.value))}
              min={1}
            />
            <button className="h-9 rounded-xl border px-3 text-sm" onClick={load}>
              Cargar
            </button>
            <input
              className="h-9 w-[140px] rounded-xl border px-3 text-sm font-mono"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              placeholder="YYYY-MM"
            />
            <button
              className="h-9 rounded-xl bg-ink-950 px-3 text-sm font-medium text-white"
              onClick={downloadPdf}
            >
              PDF salud financiera
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="text-xs text-slate-500">
            <tr className="border-b">
              <th className="px-4 py-3">Nivel</th>
              <th className="py-3 pr-3">Título</th>
              <th className="py-3 pr-3">Vence</th>
              <th className="py-3 pr-3">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={4}>
                  Sin alertas.
                </td>
              </tr>
            ) : (
              alerts.map((a) => (
                <tr key={`${a.kind}-${a.declarationId ?? a.clientId}`} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <span
                      className={
                        a.level === "RED"
                          ? "rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700"
                          : a.level === "YELLOW"
                            ? "rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700"
                            : "rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                      }
                    >
                      {a.level}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-slate-700">{a.title}</td>
                  <td className="py-3 pr-3 font-mono text-xs text-slate-700">
                    {String(a.dueDate)}
                  </td>
                  <td className="py-3 pr-3 text-slate-700">{a.kind}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

