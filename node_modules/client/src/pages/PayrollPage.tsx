/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { TableSkeleton } from "../components/TableSkeleton";
import { toast } from "sonner";

type CalcPayload = {
  salaryType: "MONTHLY" | "DAILY";
  grossSalary: number;
  daysInPeriod: number;
  integrationFactor: number;
  umaDaily: number;
  payDate?: string;
  isrMonthlyEstimate?: number;
};

export function PayrollPage() {
  const [grossSalary, setGrossSalary] = useState(18000);
  const [isrMonthlyEstimate, setIsrMonthlyEstimate] = useState(1200);
  const [payDate, setPayDate] = useState(() => new Date().toISOString());
  const [employeeName, setEmployeeName] = useState("");
  const [result, setResult] = useState<any>(null);
  const [lastPayload, setLastPayload] = useState<CalcPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const res = await apiGet<{ data: any[] }>(`/api/payroll/history`);
      setHistory(res.data);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  async function calculate() {
    setError(null);
    const payload: CalcPayload = {
      salaryType: "MONTHLY",
      grossSalary: Number(grossSalary),
      daysInPeriod: 15,
      integrationFactor: 1.0452,
      umaDaily: 113.14,
      payDate,
      isrMonthlyEstimate: Number(isrMonthlyEstimate),
    };
    try {
      const res = await apiPost<{ data: any }>(`/api/payroll/calculate`, payload);
      setResult(res.data);
      setLastPayload(payload);
      toast.success("Cálculo listo. Puedes guardar la nómina.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      toast.error(msg);
    }
  }

  async function savePayroll() {
    if (!lastPayload || !employeeName.trim()) {
      toast.error("Calcula primero e indica el nombre del colaborador.");
      return;
    }
    setError(null);
    try {
      await apiPost(`/api/payroll/history`, {
        ...lastPayload,
        employeeName: employeeName.trim(),
        fiscalYear: 2026,
      });
      toast.success("Nómina guardada (ejercicio fiscal 2026).");
      await loadHistory();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      toast.error(msg);
    }
  }

  function money(v: unknown) {
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isNaN(n)) return "—";
    return n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-slate-900">Nómina</div>
            <div className="text-sm text-slate-600">Cálculo quincenal (IMSS + Subsidio 2026). Ejercicio fiscal 2026.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="h-9 rounded-xl bg-ink-950 px-3 text-sm font-medium text-white"
              onClick={calculate}
            >
              Calcular
            </button>
            <button
              className="h-9 rounded-xl border px-3 text-sm font-medium text-slate-900 disabled:opacity-50"
              onClick={savePayroll}
              disabled={!result || !lastPayload || !employeeName.trim()}
            >
              Guardar nómina
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <label className="grid gap-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-700">Nombre del colaborador</span>
            <input
              className="h-10 rounded-xl border px-3 text-sm"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Ej. María López García"
            />
          </label>
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
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-700">Fecha de pago (ISO)</span>
            <input
              className="h-10 rounded-xl border px-3 text-sm font-mono"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
            />
          </label>
        </div>

        {error ? (
          <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</div>
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

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">Historial de nóminas guardadas</div>
          <div className="text-xs text-slate-500">Ejercicio fiscal 2026</div>
        </div>
        {loadingHistory ? (
          <TableSkeleton rows={4} cols={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr className="border-b">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="py-3 pr-3">Sueldo (mensual)</th>
                  <th className="py-3 pr-3">IMSS</th>
                  <th className="py-3 pr-3">Subsidio</th>
                  <th className="py-3 pr-3">Neto est.</th>
                  <th className="py-3 pr-3">Fecha de cálculo</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={6}>
                      Aún no hay nóminas guardadas.
                    </td>
                  </tr>
                ) : (
                  history.map((row) => (
                    <tr key={row.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-medium text-slate-900">{row.employeeName}</td>
                      <td className="py-3 pr-3 font-mono text-xs">${money(row.grossMonthly)}</td>
                      <td className="py-3 pr-3 font-mono text-xs">${money(row.imssTotal)}</td>
                      <td className="py-3 pr-3 font-mono text-xs">${money(row.subsidyApplied)}</td>
                      <td className="py-3 pr-3 font-mono text-xs">${money(row.netEstimate)}</td>
                      <td className="py-3 pr-3 font-mono text-xs text-slate-700">
                        {new Date(row.calculatedAt).toLocaleString("es-MX")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
