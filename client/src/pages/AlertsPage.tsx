/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { useEffect, useState } from "react";
import { FileBarChart2 } from "lucide-react";
import { toast } from "sonner";
import { formatMxDateTime } from "../lib/format-date";
import { apiGet, authHeader } from "../lib/api";
import { ResponsiveStackTable } from "../components/ResponsiveStackTable";
import { TableSkeleton } from "../components/TableSkeleton";

export function AlertsPage() {
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
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
    setLoading(true);
    try {
      const res = await apiGet<{ data: any[] }>(`/api/alerts?daysAhead=${daysAhead}`);
      setAlerts(res.data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    setError(null);
    if (!/^\d{4}-\d{2}$/.test(reportMonth.trim())) {
      const msg = "Usa el mes en formato YYYY-MM (ej. 2026-04).";
      setError(msg);
      toast.error(msg);
      return;
    }
    setPdfLoading(true);
    try {
      const res = await fetch(
        `/api/reports/financial-health.pdf?month=${encodeURIComponent(reportMonth.trim())}`,
        { method: "GET", headers: authHeader() },
      );
      const contentType = res.headers.get("content-type") ?? "";
      if (!res.ok) {
        const json = contentType.includes("application/json")
          ? await res.json().catch(() => ({}))
          : {};
        throw new Error(json?.error?.message ?? "No se pudo generar el PDF");
      }
      const blob = await res.blob();
      if (blob.size === 0) {
        throw new Error("El PDF llegó vacío. Revisa datos de conciliación del mes.");
      }
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      toast.success("PDF generado. Se abrió en una nueva pestaña.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      toast.error(msg);
    } finally {
      setPdfLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid max-w-full gap-4">
      <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">Alertas</div>
            <div className="text-sm text-slate-600">
              Semáforo de vencimientos. El PDF usa el mes indicado (por defecto, mes calendario actual).
            </div>
          </div>
          <div className="flex w-full min-w-0 flex-col gap-2 md:max-w-3xl md:flex-row md:flex-wrap md:items-stretch md:justify-end xl:max-w-4xl">
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch">
              <input
                className="field-touch font-mono sm:max-w-[7.5rem] md:w-28"
                type="number"
                value={daysAhead}
                onChange={(e) => setDaysAhead(Number(e.target.value))}
                min={1}
                aria-label="Días hacia adelante"
              />
              <button type="button" className="btn-touch-outline sm:min-w-[7rem]" onClick={load}>
                Cargar
              </button>
            </div>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch sm:flex-1">
              <input
                className="field-touch-mono min-w-0 sm:max-w-[11rem] md:flex-1"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                placeholder="YYYY-MM"
                aria-label="Mes del reporte"
              />
              <button
                type="button"
                className="btn-touch-primary inline-flex items-center justify-center gap-2 whitespace-normal sm:max-w-[16rem] disabled:opacity-60"
                onClick={() => void downloadPdf()}
                disabled={pdfLoading}
              >
                <FileBarChart2 className="size-5 shrink-0" aria-hidden={true} />
                {pdfLoading ? "Generando PDF…" : "PDF salud financiera"}
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {loading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : (
          <ResponsiveStackTable
            tableMinWidthClass="min-w-[min(100%,640px)]"
            rows={alerts}
            rowKey={(a) => `${a.kind}-${a.declarationId ?? a.clientId}`}
            columns={[
              {
                key: "level",
                label: "Nivel",
                mobile: (a) => (
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
                ),
                desktop: (a) => (
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
                ),
              },
              {
                key: "title",
                label: "Título",
                mobile: (a) => <span className="break-words text-left">{a.title}</span>,
                desktop: (a) => <span className="text-slate-700">{a.title}</span>,
              },
              {
                key: "due",
                label: "Vence",
                mobile: (a) => (
                  <span className="break-words text-xs">{formatMxDateTime(a.dueDate)}</span>
                ),
                desktop: (a) => (
                  <span className="max-w-[11rem] whitespace-normal break-words text-xs text-slate-700">
                    {formatMxDateTime(a.dueDate)}
                  </span>
                ),
              },
              {
                key: "kind",
                label: "Tipo",
                mobile: (a) => <span>{a.kind}</span>,
                desktop: (a) => <span className="text-slate-700">{a.kind}</span>,
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
