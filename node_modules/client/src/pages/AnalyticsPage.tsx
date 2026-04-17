/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileBarChart2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiGet } from "../lib/api";
import { TableSkeleton } from "../components/TableSkeleton";
import { toast } from "sonner";
import { useMediaQuery } from "../hooks/useMediaQuery";

type Dashboard = {
  fiscalYear: number;
  incomeByMonth: { month: string; income: number }[];
  declarationsByMonth: { month: string; byStatus: Record<string, number> }[];
  invoicePie: { paid: number; pending: number };
};

const COLORS = ["#0f172a", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"];

export function AnalyticsPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 1200px)");
  const isTablet = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet<{ data: Dashboard }>(`/api/analytics/dashboard`);
        if (!cancelled) setData(res.data);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "No se pudieron cargar las métricas");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const combined =
    data?.incomeByMonth.map((inc, i) => {
      const decl = data.declarationsByMonth[i]?.byStatus ?? {};
      const declTotal = Object.values(decl).reduce((a, b) => a + b, 0);
      return {
        label: inc.month.slice(5),
        ingresos: inc.income,
        declaraciones: declTotal,
        ...decl,
      };
    }) ?? [];

  const pieData = data
    ? [
        { name: "Pagadas", value: data.invoicePie.paid },
        { name: "Pendientes", value: data.invoicePie.pending },
      ]
    : [];

  const barHeight = isDesktop ? 360 : isTablet ? 300 : 260;
  const pieOuter = isDesktop ? 110 : isTablet ? 95 : 72;

  if (loading) {
    return (
      <div className="max-w-full rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-lg font-semibold text-slate-900">Analytics</div>
        <TableSkeleton rows={8} cols={4} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-full rounded-2xl border bg-white p-6 text-sm text-slate-600 shadow-sm">
        No hay datos de analytics.
      </div>
    );
  }

  return (
    <div className="grid max-w-full gap-6">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-slate-900 xl:text-xl">
          Analytics · {data.fiscalYear}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Ingresos conciliados (créditos), declaraciones por mes y estado de facturas recurrentes.
        </p>
        <div className="mt-3">
          <Link
            to="/alerts"
            className="inline-flex min-h-[44px] max-w-full items-center justify-center gap-2 rounded-xl bg-ink-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-900 sm:min-h-10 sm:inline-flex sm:px-5"
          >
            <FileBarChart2 className="size-5 shrink-0" aria-hidden={true} />
            Reporte PDF · Salud financiera
          </Link>
          <p className="mt-1.5 text-xs text-slate-500">
            Abre Alertas para elegir el mes (YYYY-MM) y descargar el PDF ejecutivo.
          </p>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border bg-white p-4 shadow-sm sm:p-5 xl:p-6">
        <div className="text-sm font-semibold text-slate-900 md:text-base">
          Ingresos mensuales vs. actividad fiscal (declaraciones registradas por mes)
        </div>
        <div className="mt-4 w-full min-w-0" style={{ height: barHeight }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={barHeight}>
            <BarChart
              data={combined}
              margin={{ top: 8, right: isTablet ? 12 : 4, left: isTablet ? 4 : 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: isTablet ? 11 : 10 }} interval="preserveStartEnd" />
              <YAxis yAxisId="left" width={isTablet ? 44 : 36} tick={{ fontSize: 10 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                width={isTablet ? 44 : 36}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                formatter={(value, name) => [
                  Number(value ?? 0),
                  name === "ingresos" ? "Ingresos MXN" : String(name ?? ""),
                ]}
                contentStyle={{ fontSize: 12, maxWidth: "min(100vw - 2rem, 280px)" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                yAxisId="left"
                dataKey="ingresos"
                name="Ingresos (MXN)"
                fill="#0f172a"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="declaraciones"
                name="# Declaraciones"
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border bg-white p-4 shadow-sm sm:p-5 xl:p-6">
        <div className="text-sm font-semibold text-slate-900 md:text-base">
          Facturas recurrentes · Pagadas vs. pendientes
        </div>
        <div className="mx-auto mt-4 w-full max-w-full min-w-0 md:max-w-md xl:max-w-lg" style={{ height: isTablet ? 300 : 240 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={pieOuter}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [Number(v ?? 0), "Cantidad"]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
