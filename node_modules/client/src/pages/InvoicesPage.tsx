/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileDown } from "lucide-react";
import { ResponsiveStackTable } from "../components/ResponsiveStackTable";
import { TableSkeleton } from "../components/TableSkeleton";
import { buildRecurringInvoicesCsv, downloadUtf8Csv } from "../lib/export-csv";
import { apiGet, apiPost, authHeader } from "../lib/api";
import { datetimeLocalToIso, formatMxDateTime, isoToDatetimeLocal } from "../lib/format-date";

function paymentLabel(status: string | undefined) {
  switch (status) {
    case "PAID":
      return "Pagada";
    case "OVERDUE":
      return "Vencida";
    case "PENDING":
    default:
      return "Pendiente";
  }
}

function frequencyLabel(f: string) {
  switch (f) {
    case "MONTHLY":
      return "Mensual";
    case "BIMONTHLY":
      return "Bimestral";
    case "QUARTERLY":
      return "Trimestral";
    case "YEARLY":
      return "Anual";
    default:
      return f;
  }
}

export function InvoicesPage() {
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
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
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    setError(null);
    try {
      await apiPost(`/api/invoices/recurring`, {
        ...form,
        amount: Number(form.amount),
      });
      toast.success("Factura recurrente creada.");
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      toast.error(msg);
    }
  }

  async function toggleActive(inv: any) {
    setError(null);
    try {
      const res = await fetch(`/api/invoices/recurring/${inv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ active: !inv.active }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message ?? "No se pudo actualizar");
      toast.success(inv.active ? "Factura desactivada." : "Factura activada.");
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
      const res = await fetch(`/api/invoices/recurring/${id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message ?? "No se pudo eliminar");
      toast.success("Factura eliminada.");
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

  function exportInvoicesCsv() {
    if (items.length === 0) {
      toast.error("No hay facturas para exportar. Pulsa Refrescar primero.");
      return;
    }
    const day = new Date().toISOString().slice(0, 10);
    const rows = items.map((inv) => ({
      id: inv.id,
      clientName: String(inv.client?.name ?? ""),
      clientRfc: String(inv.client?.rfc ?? ""),
      concept: String(inv.concept ?? ""),
      amount: inv.amount,
      currency: String(inv.currency ?? "MXN"),
      frequency: String(inv.frequency ?? ""),
      paymentStatus: String(inv.paymentStatus ?? ""),
      pendingBalance: inv.pendingBalance != null ? inv.pendingBalance : "",
      nextRunDate: inv.nextRunDate != null ? String(inv.nextRunDate) : "",
      active: Boolean(inv.active),
    }));
    downloadUtf8Csv(`facturas-recurrentes-${day}.csv`, buildRecurringInvoicesCsv(rows));
    toast.success("CSV descargado (UTF-8 con BOM, listo para Excel).");
  }

  return (
    <div className="grid max-w-full gap-4">
      <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">Facturas recurrentes</div>
            <div className="text-sm text-slate-600">
              Crear y listar recurrentes. Exporta el listado a CSV para Excel o otros sistemas.
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <button type="button" className="btn-touch-outline shrink-0" onClick={load}>
              Refrescar
            </button>
            <button
              type="button"
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-ink-950 px-4 text-sm font-medium text-white shadow-sm disabled:opacity-50 sm:min-h-10 sm:w-auto md:px-5"
              onClick={exportInvoicesCsv}
              disabled={loading || items.length === 0}
            >
              <FileDown className="size-5 shrink-0" aria-hidden={true} />
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6">
          <label className="grid min-w-0 gap-1 sm:col-span-2 lg:col-span-2">
            <span className="text-xs font-medium text-slate-700">Cliente</span>
            <select
              className="field-touch bg-white"
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
          <label className="grid min-w-0 gap-1 sm:col-span-2 lg:col-span-2">
            <span className="text-xs font-medium text-slate-700">Concepto</span>
            <input
              className="field-touch"
              value={form.concept}
              onChange={(e) => setForm({ ...form, concept: e.target.value })}
            />
          </label>
          <label className="grid min-w-0 gap-1">
            <span className="text-xs font-medium text-slate-700">Monto</span>
            <input
              className="field-touch"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            />
          </label>
          <label className="grid min-w-0 gap-1">
            <span className="text-xs font-medium text-slate-700">Frecuencia</span>
            <select
              className="field-touch bg-white"
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            >
              <option value="MONTHLY">Mensual</option>
              <option value="BIMONTHLY">Bimestral</option>
              <option value="QUARTERLY">Trimestral</option>
              <option value="YEARLY">Anual</option>
            </select>
          </label>

          <label className="grid min-w-0 gap-1 sm:col-span-2">
            <span className="text-xs font-medium text-slate-700">Inicio</span>
            <input
              className="field-touch-mono min-w-0"
              type="datetime-local"
              value={isoToDatetimeLocal(form.startDate)}
              onChange={(e) =>
                setForm({ ...form, startDate: datetimeLocalToIso(e.target.value) })
              }
            />
          </label>
          <label className="grid min-w-0 gap-1 sm:col-span-2">
            <span className="text-xs font-medium text-slate-700">Próxima ejecución</span>
            <input
              className="field-touch-mono min-w-0"
              type="datetime-local"
              value={isoToDatetimeLocal(form.nextRunDate)}
              onChange={(e) =>
                setForm({ ...form, nextRunDate: datetimeLocalToIso(e.target.value) })
              }
            />
          </label>
          <label className="flex min-h-[44px] items-center gap-3 md:min-h-0">
            <input
              type="checkbox"
              className="size-5 shrink-0 rounded border-slate-300 md:size-4"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <span className="text-sm text-slate-700">Activa</span>
          </label>
          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <button
              type="button"
              className="btn-touch-primary"
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

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {loading ? (
          <TableSkeleton rows={5} cols={9} />
        ) : (
          <ResponsiveStackTable
            tableMinWidthClass="min-w-[1080px]"
            rows={items}
            rowKey={(inv) => inv.id}
            columns={[
              {
                key: "client",
                label: "Cliente",
                mobile: (inv) => (
                  <span className="font-medium">{inv.client?.name ?? inv.clientId}</span>
                ),
                desktop: (inv) => (
                  <span className="font-medium text-slate-900">
                    {inv.client?.name ?? inv.clientId}
                  </span>
                ),
              },
              {
                key: "concept",
                label: "Concepto",
                mobile: (inv) => <span>{inv.concept}</span>,
                desktop: (inv) => <span className="text-slate-700">{inv.concept}</span>,
              },
              {
                key: "amount",
                label: "Monto",
                mobile: (inv) => (
                  <span className="font-mono text-xs">
                    {inv.currency} {String(inv.amount)}
                  </span>
                ),
                desktop: (inv) => (
                  <span className="font-mono text-xs text-slate-700">
                    {inv.currency} {String(inv.amount)}
                  </span>
                ),
              },
              {
                key: "pay",
                label: "Estado pago",
                mobile: (inv) => <span>{paymentLabel(inv.paymentStatus)}</span>,
                desktop: (inv) => (
                  <span className="text-slate-700">{paymentLabel(inv.paymentStatus)}</span>
                ),
              },
              {
                key: "balance",
                label: "Saldo pendiente",
                mobile: (inv) => (
                  <span className="font-mono text-xs">
                    {inv.pendingBalance != null
                      ? Number(inv.pendingBalance).toLocaleString("es-MX", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "—"}
                  </span>
                ),
                desktop: (inv) => (
                  <span className="font-mono text-xs text-slate-700">
                    {inv.pendingBalance != null
                      ? Number(inv.pendingBalance).toLocaleString("es-MX", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "—"}
                  </span>
                ),
              },
              {
                key: "freq",
                label: "Frecuencia",
                mobile: (inv) => <span>{frequencyLabel(inv.frequency)}</span>,
                desktop: (inv) => (
                  <span className="text-slate-700">{frequencyLabel(inv.frequency)}</span>
                ),
              },
              {
                key: "next",
                label: "Próxima",
                mobile: (inv) => (
                  <span className="text-xs">{formatMxDateTime(inv.nextRunDate)}</span>
                ),
                desktop: (inv) => (
                  <span className="font-mono text-xs text-slate-700">
                    {formatMxDateTime(inv.nextRunDate)}
                  </span>
                ),
              },
              {
                key: "active",
                label: "Activa",
                mobile: (inv) => <span>{inv.active ? "Sí" : "No"}</span>,
                desktop: (inv) => <span className="text-slate-700">{inv.active ? "Sí" : "No"}</span>,
              },
              {
                key: "actions",
                label: "Acciones",
                mobile: (inv) => (
                  <div className="flex w-full flex-col gap-2">
                    <button
                      type="button"
                      className="btn-touch-outline"
                      onClick={() => toggleActive(inv)}
                    >
                      {inv.active ? "Desactivar" : "Activar"}
                    </button>
                    <button type="button" className="btn-touch-outline" onClick={() => remove(inv.id)}>
                      Eliminar
                    </button>
                  </div>
                ),
                desktop: (inv) => (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="inline-flex min-h-10 items-center rounded-lg border px-3 text-sm"
                      onClick={() => toggleActive(inv)}
                    >
                      {inv.active ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex min-h-10 items-center rounded-lg border px-3 text-sm"
                      onClick={() => remove(inv.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
