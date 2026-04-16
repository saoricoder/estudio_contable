/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ResponsiveStackTable } from "../components/ResponsiveStackTable";
import { TableSkeleton } from "../components/TableSkeleton";
import { apiGet, apiPost, authHeader } from "../lib/api";
import { isValidRfc } from "../lib/rfc";

export function ClientsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    try {
      const res = await apiGet<{ data: any[] }>(`/api/clients`);
      setData(res.data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    setError(null);
    const rfc = form.rfc.trim().toUpperCase();
    if (!isValidRfc(rfc)) {
      const msg =
        "RFC inválido: persona moral 12 caracteres; persona física 13 (solo letras/números permitidos).";
      setError(msg);
      toast.error(msg);
      return;
    }
    try {
      await apiPost(`/api/clients`, {
        name: form.name,
        rfc,
        regimen: form.regimen,
        email: form.email || undefined,
        phone: form.phone || undefined,
      });
      setForm({ name: "", rfc: "", regimen: "601", email: "", phone: "" });
      toast.success("Cliente guardado.");
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      toast.error(msg);
    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE", headers: authHeader() });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message ?? "No se pudo eliminar");
      toast.success("Cliente eliminado.");
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      toast.error(msg);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid max-w-full gap-4">
      <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">Clientes</div>
            <div className="text-sm text-slate-600">CRUD mínimo del MVP.</div>
          </div>
          <button type="button" className="btn-touch-outline shrink-0" onClick={load}>
            Cargar
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          <input
            className="field-touch"
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="field-touch-mono uppercase"
            placeholder="RFC (12 o 13 caracteres)"
            value={form.rfc}
            onChange={(e) => setForm({ ...form, rfc: e.target.value.toUpperCase() })}
            maxLength={13}
            autoComplete="off"
          />
          <input
            className="field-touch"
            placeholder="Régimen (ej. 601)"
            value={form.regimen}
            onChange={(e) => setForm({ ...form, regimen: e.target.value })}
          />
          <input
            className="field-touch"
            placeholder="Email (opcional)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch xl:col-span-1">
            <input
              className="field-touch sm:flex-1"
              placeholder="Tel (opcional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <button type="button" className="btn-touch-primary sm:max-w-[10rem]" onClick={create}>
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

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {loading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : (
          <ResponsiveStackTable
            tableMinWidthClass="min-w-[720px]"
            rows={data}
            rowKey={(c) => c.id}
            columns={[
              {
                key: "name",
                label: "Nombre",
                mobile: (c) => <span className="font-medium">{c.name}</span>,
                desktop: (c) => <span className="font-medium text-slate-900">{c.name}</span>,
              },
              {
                key: "rfc",
                label: "RFC",
                mobile: (c) => <span className="font-mono text-xs">{c.rfc}</span>,
                desktop: (c) => <span className="font-mono text-xs text-slate-700">{c.rfc}</span>,
              },
              {
                key: "regimen",
                label: "Régimen",
                mobile: (c) => <span>{c.regimen}</span>,
                desktop: (c) => <span className="text-slate-700">{c.regimen}</span>,
              },
              {
                key: "actions",
                label: "Acciones",
                mobile: (c) => (
                  <button
                    type="button"
                    className="btn-touch-outline border-rose-200 text-rose-800"
                    onClick={() => remove(c.id)}
                  >
                    Eliminar
                  </button>
                ),
                desktop: (c) => (
                  <button
                    type="button"
                    className="inline-flex min-h-10 items-center rounded-lg border px-3 text-sm"
                    onClick={() => remove(c.id)}
                  >
                    Eliminar
                  </button>
                ),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
