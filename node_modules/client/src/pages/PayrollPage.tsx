/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { useState } from "react";
import { apiPost } from "../lib/api";

export function PayrollPage() {
  const [grossSalary, setGrossSalary] = useState(18000);
  const [isrMonthlyEstimate, setIsrMonthlyEstimate] = useState(1200);
  const [payDate, setPayDate] = useState(() => new Date().toISOString());
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function calculate() {
    setError(null);
    try {
      const res = await apiPost<{ data: any }>(`/api/payroll/calculate`, {
        salaryType: "MONTHLY",
        grossSalary: Number(grossSalary),
        daysInPeriod: 15,
        integrationFactor: 1.0452,
        umaDaily: 113.14,
        payDate,
        isrMonthlyEstimate: Number(isrMonthlyEstimate),
      });
      setResult(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-slate-900">Nómina</div>
            <div className="text-sm text-slate-600">Cálculo quincenal (IMSS + Subsidio 2026).</div>
          </div>
          <button
            className="h-9 rounded-xl bg-ink-950 px-3 text-sm font-medium text-white"
            onClick={calculate}
          >
            Calcular
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-700">Sueldo mensual bruto</span>
            <input
              className="h-10 rounded-xl border px-3 text-sm"
              type="number"
              value={grossSalary}
              onChange={(e) => setGrossSalary(Number(e.target.value))}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-700">ISR mensual (estimado)</span>
            <input
              className="h-10 rounded-xl border px-3 text-sm"
              type="number"
              value={isrMonthlyEstimate}
              onChange={(e) => setIsrMonthlyEstimate(Number(e.target.value))}
            />
          </label>
          <label className="grid gap-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-700">Fecha de pago (ISO)</span>
            <input
              className="h-10 rounded-xl border px-3 text-sm font-mono"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              placeholder="2026-04-15T00:00:00.000Z"
            />
          </label>
        </div>

        {error ? (
          <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </div>
        ) : null}
      </div>

      {result ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Stat label="Bruto quincenal" value={`$${result.gross.period}`} />
          <Stat label="IMSS (cuota obrera)" value={`$${result.imss.employeeContrib.total}`} />
          <Stat label="Neto estimado" value={`$${result.netEstimate}`} />

          <div className="lg:col-span-3 rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Detalle IMSS (cuota obrera)</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-5">
              <Mini label="EM dinero" value={result.imss.employeeContrib.emDinero} />
              <Mini label="EM GMP" value={result.imss.employeeContrib.emGmp} />
              <Mini label="EM excedente" value={result.imss.employeeContrib.emExcedente} />
              <Mini label="IV" value={result.imss.employeeContrib.invalidezVida} />
              <Mini label="CV" value={result.imss.employeeContrib.cesantiaVejez} />
            </div>
            <div className="mt-4 text-xs text-slate-500">
              {Array.isArray(result.disclaimers) ? result.disclaimers.join(" · ") : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 font-mono text-xs text-slate-900">${value}</div>
    </div>
  );
}

