import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

export function InvoicesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const [form, setForm] = useState({
    clientId: "",
    concept: "Honorarios contables",
    amount: 2500,
    currency: "MXN",
    frequency: "MONTHLY",
    startDate: iso(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))),
    nextRunDate: iso(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))),
    active: true,
  });

  async function load() {
    setError(null);
    try {
      const [iRes, cRes] = await Promise.all([
        apiGet<{ data: any[] }>(`/api/invoices/recurring`),
        apiGet<{ data: any[] }>(`/api/clients`),
      ]);
      setItems(iRes.data);
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
      await apiPost(`/api/invoices/recurring`, {
        ...form,
        amount: Number(form.amount),
      });
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
            <div className="text-lg font-semibold text-slate-900">Facturas recurrentes</div>
            <div className="text-sm text-slate-600">Crear y listar recurrentes.</div>
          </div>
          <button className="h-9 rounded-xl border px-3 text-sm" onClick={load}>
            Refrescar
          </button>
        </div>

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
          <label className="grid gap-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-700">Concepto</span>
            <input
              className="h-10 rounded-xl border px-3 text-sm"
              value={form.concept}
              onChange={(e) => setForm({ ...form, concept: e.target.value })}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-700">Monto</span>
            <input
              className="h-10 rounded-xl border px-3 text-sm"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-700">Frecuencia</span>
            <select
              className="h-10 rounded-xl border bg-white px-3 text-sm"
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            >
              <option value="MONTHLY">Mensual</option>
              <option value="BIMONTHLY">Bimestral</option>
              <option value="QUARTERLY">Trimestral</option>
              <option value="YEARLY">Anual</option>
            </select>
          </label>

          <label className="grid gap-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-700">Inicio (ISO)</span>
            <input
              className="h-10 rounded-xl border px-3 text-sm font-mono"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </label>
          <label className="grid gap-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-700">Próxima (ISO)</span>
            <input
              className="h-10 rounded-xl border px-3 text-sm font-mono"
              value={form.nextRunDate}
              onChange={(e) => setForm({ ...form, nextRunDate: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 md:col-span-1">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <span className="text-sm text-slate-700">Activa</span>
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
              <th className="py-3 pr-3">Concepto</th>
              <th className="py-3 pr-3">Monto</th>
              <th className="py-3 pr-3">Frecuencia</th>
              <th className="py-3 pr-3">Próxima</th>
              <th className="py-3 pr-3">Activa</th>
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
              items.map((inv) => (
                <tr key={inv.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {inv.client?.name ?? inv.clientId}
                  </td>
                  <td className="py-3 pr-3 text-slate-700">{inv.concept}</td>
                  <td className="py-3 pr-3 font-mono text-xs text-slate-700">
                    {inv.currency} {String(inv.amount)}
                  </td>
                  <td className="py-3 pr-3 text-slate-700">{inv.frequency}</td>
                  <td className="py-3 pr-3 font-mono text-xs text-slate-700">
                    {String(inv.nextRunDate)}
                  </td>
                  <td className="py-3 pr-3 text-slate-700">
                    {inv.active ? "Sí" : "No"}
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

