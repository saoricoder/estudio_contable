import {
  Bell,
  BookOpenCheck,
  Building2,
  FileText,
  Landmark,
  Lock,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { apiGet, apiPost, setToken } from "./lib/api";

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

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-ink-950 text-white">
              <ShieldCheck className="size-5" aria-hidden="true" />
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
                <Lock className="size-4" aria-hidden="true" />
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
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-sm text-slate-600">{desc}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
