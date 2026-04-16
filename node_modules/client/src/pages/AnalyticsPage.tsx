/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { useEffect, useState } from "react";
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

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-lg font-semibold text-slate-900">Analytics</div>
        <TableSkeleton rows={8} cols={4} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600 shadow-sm">
        No hay datos de analytics.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Analytics · {data.fiscalYear}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Ingresos conciliados (créditos), declaraciones por mes y estado de facturas recurrentes.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">
          Ingresos mensuales vs. actividad fiscal (declaraciones registradas por mes)
        </div>
        <div className="mt-4 h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={combined} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value, name) => [
                  Number(value ?? 0),
                  name === "ingresos" ? "Ingresos MXN" : String(name ?? ""),
                ]}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="ingresos" name="Ingresos (MXN)" fill="#0f172a" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="declaraciones" name="# Declaraciones" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Facturas recurrentes · Pagadas vs. pendientes</div>
        <div className="mt-4 h-[280px] w-full max-w-md">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [Number(v ?? 0), "Cantidad"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
