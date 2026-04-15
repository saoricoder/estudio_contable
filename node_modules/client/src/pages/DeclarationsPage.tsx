import { useEffect, useState } from "react";
import { apiGet, apiPost, authHeader } from "../lib/api";

export function DeclarationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    clientId: "",
    type: "PROVISIONAL",
    status: "PENDING",
    period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
    dueDate: new Date().toISOString(),
    notes: "",
  });

  async function load() {
    setError(null);
    try {
      const [dRes, dashRes, cRes] = await Promise.all([
        apiGet<{ data: any[] }>(`/api/declarations`),
        apiGet<{ data: any }>(`/api/declarations/dashboard`),
        apiGet<{ data: any[] }>(`/api/clients`),
      ]);
      setItems(dRes.data);
      setDashboard(dashRes.data);
      setClients(cRes.data);
      if (!form.clientId && cRes.data[0]?.id) {
        setForm((f) => ({ ...f, clientId: cRes.data[0].id }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function create() {
    setError(null);
    try {
      await apiPost(`/api/declarations`, {
        ...form,
        notes: form.notes || undefined,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function setStatus(id: string, status: string) {
    setError(null);
    try {
      const res = await fetch(`/api/declarations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ status }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message ?? "No se pudo actualizar");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/declarations/${id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message ?? "No se pudo eliminar");
      await load();
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
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-slate-900">Declaraciones</div>
            <div className="text-sm text-slate-600">Registro y dashboard mínimo.</div>
          </div>
          <button className="h-9 rounded-xl border px-3 text-sm" onClick={load}>
            Cargar
          </button>
        </div>

        {dashboard ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(dashboard.totals ?? []).map((t: any) => (
              <div key={t.status} className="rounded-2xl border bg-white p-3">
                <div className="text-xs text-slate-500">{t.status}</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">{t.count}</div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 md:grid-cols-6">
          <label className="grid gap-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-700">Cliente</span>
            <select
              className="h-10 rounded-xl border bg-white px-3 text-sm"
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.rfc}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-700">Tipo</span>
            <select
              className="h-10 rounded-xl border bg-white px-3 text-sm"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="PROVISIONAL">PROVISIONAL</option>
              <option value="VAT">VAT</option>
              <option value="PAYROLL">PAYROLL</option>
              <option value="ANNUAL">ANNUAL</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-700">Estatus</span>
            <select
              className="h-10 rounded-xl border bg-white px-3 text-sm"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="PENDING">PENDING</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="PAID">PAID</option>
              <option value="OVERDUE">OVERDUE</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-700">Periodo (YYYY-MM)</span>
            <input
              className="h-10 rounded-xl border px-3 text-sm font-mono"
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
              placeholder="2026-04"
            />
          </label>
          <label className="grid gap-1 md:col-span-1">
            <span className="text-xs font-medium text-slate-700">Vence (ISO)</span>
            <input
              className="h-10 rounded-xl border px-3 text-sm font-mono"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </label>
          <label className="grid gap-1 md:col-span-5">
            <span className="text-xs font-medium text-slate-700">Notas (opcional)</span>
            <input
              className="h-10 rounded-xl border px-3 text-sm"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
          <div className="md:col-span-1 flex items-end">
            <button
              className="h-10 w-full rounded-xl bg-ink-950 px-3 text-sm font-medium text-white"
              onClick={create}
              disabled={!form.clientId}
            >
              Crear
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
              <th className="px-4 py-3">Cliente</th>
              <th className="py-3 pr-3">Tipo</th>
              <th className="py-3 pr-3">Periodo</th>
              <th className="py-3 pr-3">Vence</th>
              <th className="py-3 pr-3">Estatus</th>
              <th className="py-3 pr-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={6}>
                  Sin datos.
                </td>
              </tr>
            ) : (
              items.map((d) => (
                <tr key={d.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {d.client?.name ?? d.clientId}
                  </td>
                  <td className="py-3 pr-3 text-slate-700">{d.type}</td>
                  <td className="py-3 pr-3 font-mono text-xs text-slate-700">
                    {d.period}
                  </td>
                  <td className="py-3 pr-3 font-mono text-xs text-slate-700">
                    {String(d.dueDate)}
                  </td>
                  <td className="py-3 pr-3">
                    <select
                      className="h-8 rounded-lg border bg-white px-2 text-xs"
                      value={d.status}
                      onChange={(e) => setStatus(d.id, e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="SUBMITTED">SUBMITTED</option>
                      <option value="PAID">PAID</option>
                      <option value="OVERDUE">OVERDUE</option>
                    </select>
                  </td>
                  <td className="py-3 pr-3">
                    <button
                      className="rounded-lg border px-2 py-1 text-xs"
                      onClick={() => remove(d.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

