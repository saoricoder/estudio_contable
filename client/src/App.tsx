import {
  Bell,
  BookOpenCheck,
  Building2,
  Download,
  FileText,
  Flag,
  ListChecks,
  Landmark,
  Lock,
  RefreshCcw,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { apiGet, apiPost, authHeader, setToken } from "./lib/api";

function App() {
  const [jwt, setJwt] = useState<string | null>(null);
  const [email, setEmail] = useState("admin@contadoresmx.com");
  const [password, setPassword] = useState("Password123!");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [clients, setClients] = useState<
    Array<{ id: string; name: string; rfc: string; regimen: string }>
  >([]);
  const [clientsError, setClientsError] = useState<string | null>(null);

  const [grossSalary, setGrossSalary] = useState(18000);
  const [isrMonthlyEstimate, setIsrMonthlyEstimate] = useState(1200);
  const [payrollResult, setPayrollResult] = useState<any>(null);
  const [payrollError, setPayrollError] = useState<string | null>(null);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);

  const [movements, setMovements] = useState<any[]>([]);
  const [statements, setStatements] = useState<any[]>([]);
  const [bankingError, setBankingError] = useState<string | null>(null);
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(null);
  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(null);

  const [declarations, setDeclarations] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [declError, setDeclError] = useState<string | null>(null);
  const [reportMonth, setReportMonth] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}`;
  });

  useEffect(() => {
    setToken(jwt);
  }, [jwt]);

  const isAuthed = useMemo(() => Boolean(jwt), [jwt]);

  async function handleRegister() {
    setAuthError(null);
    setLoading(true);
    try {
      const res = await apiPost<{ token: string }>(`/api/auth/register`, {
        email,
        password,
      });
      setJwt(res.token);
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    setAuthError(null);
    setLoading(true);
    try {
      const res = await apiPost<{ token: string }>(`/api/auth/login`, {
        email,
        password,
      });
      setJwt(res.token);
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function loadClients() {
    setClientsError(null);
    try {
      const res = await apiGet<{ data: any[] }>(`/api/clients`);
      setClients(res.data);
    } catch (e) {
      setClientsError(e instanceof Error ? e.message : "Error");
    }
  }

  async function calculatePayroll() {
    setPayrollError(null);
    try {
      const res = await apiPost<{ data: any }>(`/api/payroll/calculate`, {
        salaryType: "MONTHLY",
        grossSalary: Number(grossSalary),
        daysInPeriod: 15,
        integrationFactor: 1.0452,
        umaDaily: 108.57,
        isrMonthlyEstimate: Number(isrMonthlyEstimate),
      });
      setPayrollResult(res.data);
    } catch (e) {
      setPayrollError(e instanceof Error ? e.message : "Error");
    }
  }

  async function loadRecurringInvoices() {
    setInvoicesError(null);
    try {
      const res = await apiGet<{ data: any[] }>(`/api/invoices/recurring`);
      setInvoices(res.data);
    } catch (e) {
      setInvoicesError(e instanceof Error ? e.message : "Error");
    }
  }

  async function loadBanking() {
    setBankingError(null);
    try {
      const [mRes, sRes] = await Promise.all([
        apiGet<{ data: any[] }>(`/api/banking/movements`),
        apiGet<{ data: any[] }>(`/api/banking/statements`),
      ]);
      setMovements(mRes.data);
      setStatements(sRes.data);
    } catch (e) {
      setBankingError(e instanceof Error ? e.message : "Error");
    }
  }

  async function matchSelected() {
    if (!selectedMovementId || !selectedStatementId) return;
    setBankingError(null);
    try {
      await apiPost(`/api/banking/match`, {
        movementId: selectedMovementId,
        statementLineId: selectedStatementId,
      });
      setSelectedMovementId(null);
      setSelectedStatementId(null);
      await loadBanking();
    } catch (e) {
      setBankingError(e instanceof Error ? e.message : "Error");
    }
  }

  async function unmatchMovement(movementId: string) {
    setBankingError(null);
    try {
      const res = await fetch(`/api/banking/match/movement/${movementId}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message ?? "Request failed");
      await loadBanking();
    } catch (e) {
      setBankingError(e instanceof Error ? e.message : "Error");
    }
  }

  async function loadDeclarationsAndAlerts() {
    setDeclError(null);
    try {
      const [dRes, aRes] = await Promise.all([
        apiGet<{ data: any[] }>(`/api/declarations`),
        apiGet<{ data: any[] }>(`/api/alerts?daysAhead=30`),
      ]);
      setDeclarations(dRes.data);
      setAlerts(aRes.data);
    } catch (e) {
      setDeclError(e instanceof Error ? e.message : "Error");
    }
  }

  async function downloadFinancialHealthPdf() {
    setDeclError(null);
    try {
      const res = await fetch(`/api/reports/financial-health.pdf?month=${encodeURIComponent(reportMonth)}`, {
        method: "GET",
        headers: authHeader(),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error?.message ?? "No se pudo generar el PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      // liberar luego
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (e) {
      setDeclError(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-ink-950 text-white">
              <ShieldCheck className="size-5" aria-hidden={true} />
            </div>
            <div className="leading-tight">
              <div className="text-sm text-slate-500">Contadores Unidos MX</div>
              <div className="text-base font-semibold text-slate-900">
                Estudio Contable Eficiente
              </div>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            MVP en construcción · API: <code className="rounded bg-slate-100 px-2 py-1">/api/health</code>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <Lock className="size-4" aria-hidden={true} />
                Acceso (JWT)
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Usa register/login para obtener token y probar endpoints protegidos.
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Estado:{" "}
              <span className={isAuthed ? "text-emerald-700" : "text-slate-600"}>
                {isAuthed ? "Autenticado" : "No autenticado"}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1">
              <span className="text-xs font-medium text-slate-700">Email</span>
              <input
                className="h-10 rounded-xl border px-3 text-sm outline-none focus:border-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@dominio.com"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-medium text-slate-700">Password</span>
              <input
                className="h-10 rounded-xl border px-3 text-sm outline-none focus:border-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              />
            </label>
            <div className="flex items-end gap-2">
              <button
                className="h-10 flex-1 rounded-xl bg-ink-950 px-3 text-sm font-medium text-white disabled:opacity-60"
                onClick={handleRegister}
                disabled={loading}
              >
                Register
              </button>
              <button
                className="h-10 flex-1 rounded-xl border px-3 text-sm font-medium text-slate-900 disabled:opacity-60"
                onClick={handleLogin}
                disabled={loading}
              >
                Login
              </button>
            </div>
          </div>
          {authError ? (
            <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {authError}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Panel de módulos
          </h1>
          <p className="text-sm text-slate-600">
            Estructura base lista para iterar en Clientes, Nóminas, Facturación, Conciliación, Declaraciones y Alertas.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ModuleCard
            title="Clientes"
            desc="CRUD con validación de RFC y régimen fiscal."
            Icon={Building2}
          />
          <ModuleCard
            title="Nóminas quincenales"
            desc="Cálculo IMSS + subsidio al empleo (service layer)."
            Icon={Landmark}
          />
          <ModuleCard
            title="Facturación"
            desc="Registro de facturas recurrentes."
            Icon={Receipt}
          />
          <ModuleCard
            title="Conciliación bancaria"
            desc="Match simple de movimientos vs estado de cuenta."
            Icon={BookOpenCheck}
          />
          <ModuleCard
            title="Declaraciones"
            desc="Dashboard de estatus de provisionales."
            Icon={FileText}
          />
          <ModuleCard
            title="Alertas"
            desc="Semáforo de vencimientos fiscales."
            Icon={Bell}
          />
        </div>

        <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold text-slate-900">Clientes (API)</div>
            <button
              className="h-9 rounded-xl border px-3 text-sm font-medium text-slate-900 disabled:opacity-60"
              onClick={loadClients}
              disabled={!isAuthed}
              title={!isAuthed ? "Primero inicia sesión" : "Cargar"}
            >
              Cargar
            </button>
          </div>
          {!isAuthed ? (
            <div className="mt-3 text-sm text-slate-600">
              Inicia sesión para consultar <code className="rounded bg-slate-100 px-2 py-1">GET /api/clients</code>.
            </div>
          ) : null}
          {clientsError ? (
            <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {clientsError}
            </div>
          ) : null}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr className="border-b">
                  <th className="py-2 pr-3">Nombre</th>
                  <th className="py-2 pr-3">RFC</th>
                  <th className="py-2 pr-3">Régimen</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={3}>
                      Sin datos.
                    </td>
                  </tr>
                ) : (
                  clients.map((c) => (
                    <tr key={c.id} className="border-b last:border-b-0">
                      <td className="py-2 pr-3 font-medium text-slate-900">
                        {c.name}
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs text-slate-700">
                        {c.rfc}
                      </td>
                      <td className="py-2 pr-3 text-slate-700">{c.regimen}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold text-slate-900">Nómina quincenal (MVP)</div>
            <button
              className="h-9 rounded-xl bg-ink-950 px-3 text-sm font-medium text-white disabled:opacity-60"
              onClick={calculatePayroll}
              disabled={!isAuthed}
              title={!isAuthed ? "Primero inicia sesión" : "Calcular"}
            >
              Calcular
            </button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1">
              <span className="text-xs font-medium text-slate-700">Sueldo mensual bruto</span>
              <input
                className="h-10 rounded-xl border px-3 text-sm outline-none focus:border-slate-400"
                value={grossSalary}
                onChange={(e) => setGrossSalary(Number(e.target.value))}
                type="number"
                min={0}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-medium text-slate-700">ISR mensual (estimado)</span>
              <input
                className="h-10 rounded-xl border px-3 text-sm outline-none focus:border-slate-400"
                value={isrMonthlyEstimate}
                onChange={(e) => setIsrMonthlyEstimate(Number(e.target.value))}
                type="number"
                min={0}
              />
            </label>
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <div className="text-xs text-slate-500">Endpoint</div>
              <code className="rounded bg-white px-2 py-1">POST /api/payroll/calculate</code>
            </div>
          </div>
          {payrollError ? (
            <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {payrollError}
            </div>
          ) : null}
          {payrollResult ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Stat label="Bruto quincenal" value={`$${payrollResult.gross.period}`} />
              <Stat label="IMSS trabajador" value={`$${payrollResult.imss.employeeContrib.total}`} />
              <Stat label="Neto estimado" value={`$${payrollResult.netEstimate}`} />
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-600">
              Calcula para ver desglose (IMSS aproximado + subsidio MVP).
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold text-slate-900">Conciliación bancaria (MVP)</div>
            <div className="flex items-center gap-2">
              <button
                className="h-9 rounded-xl border px-3 text-sm font-medium text-slate-900 disabled:opacity-60"
                onClick={loadBanking}
                disabled={!isAuthed}
              >
                Cargar
              </button>
              <button
                className="h-9 rounded-xl bg-ink-950 px-3 text-sm font-medium text-white disabled:opacity-60"
                onClick={matchSelected}
                disabled={!isAuthed || !selectedMovementId || !selectedStatementId}
                title={!selectedMovementId || !selectedStatementId ? "Selecciona 1 movimiento y 1 línea" : "Conciliar"}
              >
                Conciliar
              </button>
            </div>
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Selecciona un movimiento (libro) y una línea (estado de cuenta) y marca el match.
          </div>
          {bankingError ? (
            <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {bankingError}
            </div>
          ) : null}

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="overflow-x-auto rounded-2xl border">
              <div className="border-b bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
                Movimientos (Libro)
              </div>
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="text-xs text-slate-500">
                  <tr className="border-b">
                    <th className="py-2 px-4">Sel</th>
                    <th className="py-2 pr-3">Fecha</th>
                    <th className="py-2 pr-3">Descripción</th>
                    <th className="py-2 pr-3">Monto</th>
                    <th className="py-2 pr-3">Match</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.length === 0 ? (
                    <tr>
                      <td className="py-3 px-4 text-slate-500" colSpan={5}>
                        Sin datos.
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => (
                      <tr key={m.id} className="border-b last:border-b-0">
                        <td className="py-2 px-4">
                          <input
                            type="radio"
                            name="movement"
                            checked={selectedMovementId === m.id}
                            onChange={() => setSelectedMovementId(m.id)}
                            disabled={Boolean(m.match)}
                            title={m.match ? "Ya conciliado" : "Seleccionar"}
                          />
                        </td>
                        <td className="py-2 pr-3 font-mono text-xs text-slate-700">
                          {String(m.date)}
                        </td>
                        <td className="py-2 pr-3 text-slate-700">{m.description}</td>
                        <td className="py-2 pr-3 font-mono text-xs text-slate-700">
                          {String(m.amount)}
                        </td>
                        <td className="py-2 pr-3">
                          {m.match ? (
                            <button
                              className="rounded-lg border px-2 py-1 text-xs"
                              onClick={() => unmatchMovement(m.id)}
                            >
                              Desmarcar
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto rounded-2xl border">
              <div className="border-b bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
                Estado de cuenta
              </div>
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="text-xs text-slate-500">
                  <tr className="border-b">
                    <th className="py-2 px-4">Sel</th>
                    <th className="py-2 pr-3">Fecha</th>
                    <th className="py-2 pr-3">Descripción</th>
                    <th className="py-2 pr-3">Monto</th>
                    <th className="py-2 pr-3">Match</th>
                  </tr>
                </thead>
                <tbody>
                  {statements.length === 0 ? (
                    <tr>
                      <td className="py-3 px-4 text-slate-500" colSpan={5}>
                        Sin datos.
                      </td>
                    </tr>
                  ) : (
                    statements.map((s) => (
                      <tr key={s.id} className="border-b last:border-b-0">
                        <td className="py-2 px-4">
                          <input
                            type="radio"
                            name="statement"
                            checked={selectedStatementId === s.id}
                            onChange={() => setSelectedStatementId(s.id)}
                            disabled={Boolean(s.match)}
                            title={s.match ? "Ya conciliado" : "Seleccionar"}
                          />
                        </td>
                        <td className="py-2 pr-3 font-mono text-xs text-slate-700">
                          {String(s.date)}
                        </td>
                        <td className="py-2 pr-3 text-slate-700">{s.description}</td>
                        <td className="py-2 pr-3 font-mono text-xs text-slate-700">
                          {String(s.amount)}
                        </td>
                        <td className="py-2 pr-3">
                          {s.match ? (
                            <span className="text-xs text-emerald-700">Conciliado</span>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <ListChecks className="size-4" aria-hidden={true} />
              Declaraciones & alertas
            </div>
            <div className="flex items-center gap-2">
              <button
                className="h-9 rounded-xl border px-3 text-sm font-medium text-slate-900 disabled:opacity-60"
                onClick={loadDeclarationsAndAlerts}
                disabled={!isAuthed}
              >
                Cargar
              </button>
              <button
                className="h-9 rounded-xl bg-ink-950 px-3 text-sm font-medium text-white disabled:opacity-60"
                onClick={downloadFinancialHealthPdf}
                disabled={!isAuthed}
                title="Generar PDF (Salud financiera)"
              >
                <span className="inline-flex items-center gap-2">
                  <Download className="size-4" aria-hidden={true} />
                  PDF
                </span>
              </button>
            </div>
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Dashboard mínimo: declaraciones registradas y semáforo de vencimientos (30 días).
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-700">
              Reporte de salud financiera (ingresos vs gastos del mes, basado en conciliación).
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-xs font-medium text-slate-600">Mes</span>
              <input
                className="h-9 w-[140px] rounded-xl border px-3 text-sm outline-none focus:border-slate-400"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                placeholder="YYYY-MM"
              />
            </label>
          </div>
          {declError ? (
            <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {declError}
            </div>
          ) : null}

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="overflow-x-auto rounded-2xl border">
              <div className="border-b bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
                Declaraciones
              </div>
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="text-xs text-slate-500">
                  <tr className="border-b">
                    <th className="py-2 px-4">Cliente</th>
                    <th className="py-2 pr-3">Tipo</th>
                    <th className="py-2 pr-3">Periodo</th>
                    <th className="py-2 pr-3">Vence</th>
                    <th className="py-2 pr-3">Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {declarations.length === 0 ? (
                    <tr>
                      <td className="py-3 px-4 text-slate-500" colSpan={5}>
                        Sin datos.
                      </td>
                    </tr>
                  ) : (
                    declarations.slice(0, 15).map((d) => (
                      <tr key={d.id} className="border-b last:border-b-0">
                        <td className="py-2 px-4 font-medium text-slate-900">
                          {d.client?.name ?? d.clientId}
                        </td>
                        <td className="py-2 pr-3 text-slate-700">{d.type}</td>
                        <td className="py-2 pr-3 font-mono text-xs text-slate-700">
                          {d.period}
                        </td>
                        <td className="py-2 pr-3 font-mono text-xs text-slate-700">
                          {String(d.dueDate)}
                        </td>
                        <td className="py-2 pr-3 text-slate-700">{d.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto rounded-2xl border">
              <div className="border-b bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
                Alertas (semaforo)
              </div>
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="text-xs text-slate-500">
                  <tr className="border-b">
                    <th className="py-2 px-4">Nivel</th>
                    <th className="py-2 pr-3">Título</th>
                    <th className="py-2 pr-3">Vence</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.length === 0 ? (
                    <tr>
                      <td className="py-3 px-4 text-slate-500" colSpan={3}>
                        Sin alertas.
                      </td>
                    </tr>
                  ) : (
                    alerts.slice(0, 15).map((a) => (
                      <tr key={`${a.kind}-${a.declarationId}`} className="border-b last:border-b-0">
                        <td className="py-2 px-4">
                          <span
                            className={
                              a.level === "RED"
                                ? "inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700"
                                : a.level === "YELLOW"
                                  ? "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700"
                                  : "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                            }
                          >
                            <Flag className="size-3" aria-hidden={true} />
                            {a.level}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-slate-700">{a.title}</td>
                        <td className="py-2 pr-3 font-mono text-xs text-slate-700">
                          {String(a.dueDate)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <RefreshCcw className="size-4" aria-hidden={true} />
              Facturas recurrentes (API)
            </div>
            <button
              className="h-9 rounded-xl border px-3 text-sm font-medium text-slate-900 disabled:opacity-60"
              onClick={loadRecurringInvoices}
              disabled={!isAuthed}
              title={!isAuthed ? "Primero inicia sesión" : "Cargar"}
            >
              Cargar
            </button>
          </div>
          {!isAuthed ? (
            <div className="mt-3 text-sm text-slate-600">
              Inicia sesión para consultar{" "}
              <code className="rounded bg-slate-100 px-2 py-1">
                GET /api/invoices/recurring
              </code>
              .
            </div>
          ) : null}
          {invoicesError ? (
            <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {invoicesError}
            </div>
          ) : null}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr className="border-b">
                  <th className="py-2 pr-3">Cliente</th>
                  <th className="py-2 pr-3">Concepto</th>
                  <th className="py-2 pr-3">Monto</th>
                  <th className="py-2 pr-3">Frecuencia</th>
                  <th className="py-2 pr-3">Próxima</th>
                  <th className="py-2 pr-3">Activa</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={6}>
                      Sin datos.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="border-b last:border-b-0">
                      <td className="py-2 pr-3 font-medium text-slate-900">
                        {inv.client?.name ?? inv.clientId}
                      </td>
                      <td className="py-2 pr-3 text-slate-700">{inv.concept}</td>
                      <td className="py-2 pr-3 font-mono text-xs text-slate-700">
                        {inv.currency} {String(inv.amount)}
                      </td>
                      <td className="py-2 pr-3 text-slate-700">{inv.frequency}</td>
                      <td className="py-2 pr-3 font-mono text-xs text-slate-700">
                        {String(inv.nextRunDate)}
                      </td>
                      <td className="py-2 pr-3 text-slate-700">
                        {inv.active ? "Sí" : "No"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function ModuleCard({
  title,
  desc,
  Icon,
}: {
  title: string;
  desc: string;
  Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-900">
          <Icon className="size-5" aria-hidden={true} />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-sm text-slate-600">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default App;
