import { useState } from "react";
import { apiGet, apiPost, authHeader } from "../lib/api";

export function ClientsPage() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    rfc: "",
    regimen: "601",
    email: "",
    phone: "",
  });

  async function load() {
    setError(null);
    try {
      const res = await apiGet<{ data: any[] }>(`/api/clients`);
      setData(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function create() {
    setError(null);
    try {
      await apiPost(`/api/clients`, {
        name: form.name,
        rfc: form.rfc,
        regimen: form.regimen,
        email: form.email || undefined,
        phone: form.phone || undefined,
      });
      setForm({ name: "", rfc: "", regimen: "601", email: "", phone: "" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE", headers: authHeader() });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message ?? "No se pudo eliminar");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-slate-900">Clientes</div>
            <div className="text-sm text-slate-600">CRUD mínimo del MVP.</div>
          </div>
          <button className="h-9 rounded-xl border px-3 text-sm" onClick={load}>
            Cargar
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <input
            className="h-10 rounded-xl border px-3 text-sm"
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="h-10 rounded-xl border px-3 text-sm"
            placeholder="RFC"
            value={form.rfc}
            onChange={(e) => setForm({ ...form, rfc: e.target.value })}
          />
          <input
            className="h-10 rounded-xl border px-3 text-sm"
            placeholder="Régimen (ej. 601)"
            value={form.regimen}
            onChange={(e) => setForm({ ...form, regimen: e.target.value })}
          />
          <input
            className="h-10 rounded-xl border px-3 text-sm"
            placeholder="Email (opcional)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              className="h-10 flex-1 rounded-xl border px-3 text-sm"
              placeholder="Tel (opcional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <button
              className="h-10 rounded-xl bg-ink-950 px-3 text-sm font-medium text-white"
              onClick={create}
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
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs text-slate-500">
            <tr className="border-b">
              <th className="px-4 py-3">Nombre</th>
              <th className="py-3 pr-3">RFC</th>
              <th className="py-3 pr-3">Régimen</th>
              <th className="py-3 pr-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={4}>
                  Sin datos.
                </td>
              </tr>
            ) : (
              data.map((c) => (
                <tr key={c.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {c.name}
                  </td>
                  <td className="py-3 pr-3 font-mono text-xs text-slate-700">
                    {c.rfc}
                  </td>
                  <td className="py-3 pr-3 text-slate-700">{c.regimen}</td>
                  <td className="py-3 pr-3">
                    <button
                      className="rounded-lg border px-2 py-1 text-xs"
                      onClick={() => remove(c.id)}
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

