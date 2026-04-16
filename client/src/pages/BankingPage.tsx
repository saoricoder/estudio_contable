/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { datetimeLocalToIso, formatMxDateTime, isoToDatetimeLocal } from "../lib/format-date";
import { apiGet, apiPost, authHeader } from "../lib/api";
import { TableSkeleton } from "../components/TableSkeleton";

export function BankingPage() {
  const [loading, setLoading] = useState(true);
  const [movements, setMovements] = useState<any[]>([]);
  const [statements, setStatements] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(null);
  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(null);
  const [selectedStatementForSuggest, setSelectedStatementForSuggest] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[] | null>(null);
  const [csvText, setCsvText] = useState("");
  const [importResult, setImportResult] = useState<string | null>(null);

  const [newMovement, setNewMovement] = useState({
    date: new Date().toISOString(),
    description: "Movimiento libro",
    reference: "",
    amount: -1500.5,
    type: "DEBIT",
  });
  const [newStatement, setNewStatement] = useState({
    date: new Date().toISOString(),
    description: "Línea estado de cuenta",
    reference: "",
    amount: -1500.5,
    type: "DEBIT",
  });

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const [mRes, sRes] = await Promise.all([
        apiGet<{ data: any[] }>(`/api/banking/movements`),
        apiGet<{ data: any[] }>(`/api/banking/statements`),
      ]);
      setMovements(mRes.data);
      setStatements(sRes.data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function createMovement() {
    setError(null);
    try {
      await apiPost(`/api/banking/movements`, {
        ...newMovement,
        reference: newMovement.reference || undefined,
        amount: Number(newMovement.amount),
      });
      toast.success("Movimiento creado.");
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      toast.error(msg);
    }
  }

  async function createStatement() {
    setError(null);
    try {
      await apiPost(`/api/banking/statements`, {
        ...newStatement,
        reference: newStatement.reference || undefined,
        amount: Number(newStatement.amount),
      });
      toast.success("Línea de estado de cuenta creada.");
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      toast.error(msg);
    }
  }

  async function matchPair(movementId: string | null, statementLineId: string | null) {
    if (!movementId || !statementLineId) return;
    setError(null);
    try {
      const res = await apiPost<{
        data: { invoiceMarkedPaid?: boolean; markedInvoiceId?: string | null };
      }>(`/api/banking/match`, {
        movementId,
        statementLineId,
      });
      setSelectedMovementId(null);
      setSelectedStatementId(null);
      toast.success(
        res.data?.invoiceMarkedPaid
          ? "Conciliación lista. Factura recurrente marcada como PAGADA (monto coincide)."
          : "Conciliación lista.",
      );
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      toast.error(msg);
    }
  }

  async function unmatchMovement(movementId: string) {
    setError(null);
    try {
      const res = await fetch(`/api/banking/match/movement/${movementId}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message ?? "Request failed");
      toast.success("Match desmarcado.");
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      toast.error(msg);
    }
  }

  async function setMovementCategory(movementId: string, category: string | null) {
    setError(null);
    try {
      const res = await fetch(`/api/banking/movements/${movementId}/category`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
        body: JSON.stringify({ category }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message ?? "No se pudo actualizar categoría");
      toast.success("Categoría actualizada.");
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      toast.error(msg);
    }
  }

  async function importCsv() {
    setError(null);
    setImportResult(null);
    try {
      const res = await apiPost<{ data: { inserted: number } }>(`/api/banking/statements/import`, {
        csv: csvText,
      });
      setImportResult(`Importadas: ${res.data.inserted}`);
      setCsvText("");
      toast.success(`Importadas ${res.data.inserted} líneas.`);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      toast.error(msg);
    }
  }

  async function suggest() {
    if (!selectedStatementForSuggest) return;
    setError(null);
    try {
      const res = await apiPost<{ data: { suggestions: any[] } }>(`/api/banking/match/suggest`, {
        statementLineId: selectedStatementForSuggest,
        maxDaysDiff: 2,
      });
      setSuggestions(res.data.suggestions);
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
    <div className="grid gap-4">
      <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">Conciliación bancaria</div>
            <div className="text-sm text-slate-600">Alta y match manual 1:1.</div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <button type="button" className="btn-touch-outline" onClick={load}>
              Cargar
            </button>
            <button
              type="button"
              className="btn-touch-primary"
              onClick={() => void matchPair(selectedMovementId, selectedStatementId)}
              disabled={!selectedMovementId || !selectedStatementId}
            >
              Conciliar
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Nuevo movimiento (Libro)</div>
            <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                className="field-touch-mono min-w-0 max-w-full"
                type="datetime-local"
                value={isoToDatetimeLocal(newMovement.date)}
                onChange={(e) =>
                  setNewMovement({ ...newMovement, date: datetimeLocalToIso(e.target.value) })
                }
              />
              <select
                className="field-touch bg-white"
                value={newMovement.type}
                onChange={(e) => setNewMovement({ ...newMovement, type: e.target.value })}
              >
                <option value="CREDIT">CREDIT</option>
                <option value="DEBIT">DEBIT</option>
              </select>
              <input
                className="field-touch sm:col-span-2"
                value={newMovement.description}
                onChange={(e) =>
                  setNewMovement({ ...newMovement, description: e.target.value })
                }
              />
              <input
                className="field-touch"
                value={newMovement.reference}
                onChange={(e) =>
                  setNewMovement({ ...newMovement, reference: e.target.value })
                }
                placeholder="Referencia (opcional)"
              />
              <input
                className="field-touch"
                type="number"
                value={newMovement.amount}
                onChange={(e) =>
                  setNewMovement({ ...newMovement, amount: Number(e.target.value) })
                }
              />
              <button
                type="button"
                className="btn-touch-primary sm:col-span-2"
                onClick={createMovement}
              >
                Crear movimiento
              </button>
            </div>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Nueva línea (Estado de cuenta)</div>
            <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                className="field-touch-mono min-w-0 max-w-full"
                type="datetime-local"
                value={isoToDatetimeLocal(newStatement.date)}
                onChange={(e) =>
                  setNewStatement({ ...newStatement, date: datetimeLocalToIso(e.target.value) })
                }
              />
              <select
                className="field-touch bg-white"
                value={newStatement.type}
                onChange={(e) => setNewStatement({ ...newStatement, type: e.target.value })}
              >
                <option value="CREDIT">CREDIT</option>
                <option value="DEBIT">DEBIT</option>
              </select>
              <input
                className="field-touch sm:col-span-2"
                value={newStatement.description}
                onChange={(e) =>
                  setNewStatement({ ...newStatement, description: e.target.value })
                }
              />
              <input
                className="field-touch"
                value={newStatement.reference}
                onChange={(e) =>
                  setNewStatement({ ...newStatement, reference: e.target.value })
                }
                placeholder="Referencia (opcional)"
              />
              <input
                className="field-touch"
                type="number"
                value={newStatement.amount}
                onChange={(e) =>
                  setNewStatement({ ...newStatement, amount: Number(e.target.value) })
                }
              />
              <button
                type="button"
                className="btn-touch-primary sm:col-span-2"
                onClick={createStatement}
              >
                Crear línea
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border bg-slate-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold text-slate-900">Importar estado de cuenta (CSV)</div>
            <button
              type="button"
              className="btn-touch-primary shrink-0 sm:max-w-xs"
              onClick={importCsv}
              disabled={!csvText.trim()}
            >
              Importar
            </button>
          </div>
          <div className="mt-2 text-xs text-slate-600">
            Columnas sugeridas: <code>fecha, descripcion, referencia, monto, tipo</code> (tipo: CREDIT/DEBIT o Cargo/Abono).
          </div>
          <textarea
            className="mt-3 min-h-[8rem] w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs outline-none focus:border-slate-400"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`fecha,descripcion,referencia,monto,tipo\n01/04/2026,SPEI a proveedor,SPEI999,-1500.50,DEBIT`}
          />
          {importResult ? (
            <div className="mt-2 text-sm text-emerald-700">{importResult}</div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
            Movimientos (Libro)
          </div>
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <>
              <div className="md:hidden">
                {movements.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">Sin datos.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {movements.map((m) => (
                      <div key={m.id} className="space-y-3 p-4 [-webkit-tap-highlight-color:transparent]">
                        <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                          <input
                            type="radio"
                            name="movement"
                            className="size-5 shrink-0 accent-ink-950"
                            checked={selectedMovementId === m.id}
                            onChange={() => setSelectedMovementId(m.id)}
                            disabled={Boolean(m.match)}
                          />
                          <span>Seleccionar para conciliar</span>
                        </label>
                        <div className="grid gap-1 text-sm">
                          <div className="text-xs text-slate-500">Fecha</div>
                          <div className="text-slate-800">{formatMxDateTime(m.date)}</div>
                          <div className="text-xs text-slate-500">Descripción</div>
                          <div className="break-words text-slate-800">{m.description}</div>
                          <div className="text-xs text-slate-500">Monto</div>
                          <div className="font-mono text-sm">{String(m.amount)}</div>
                        </div>
                        <div>
                          <div className="mb-1 text-xs font-medium text-slate-600">Categoría</div>
                          <select
                            className="field-touch bg-white text-sm"
                            value={m.category ?? ""}
                            onChange={(e) => setMovementCategory(m.id, e.target.value || null)}
                            disabled={!m.match}
                            title={!m.match ? "Concílialo primero para categorizar" : "Categoría"}
                          >
                            <option value="">Sin categoría</option>
                            <option value="Ventas">Ventas</option>
                            <option value="Servicios">Servicios</option>
                            <option value="Nómina">Nómina</option>
                            <option value="Renta">Renta</option>
                            <option value="Impuestos">Impuestos</option>
                            <option value="Comisiones bancarias">Comisiones bancarias</option>
                            <option value="Proveedores">Proveedores</option>
                            <option value="Otros">Otros</option>
                          </select>
                        </div>
                        {m.match ? (
                          <button
                            type="button"
                            className="btn-touch-outline"
                            onClick={() => unmatchMovement(m.id)}
                          >
                            Desmarcar match
                          </button>
                        ) : (
                          <div className="text-xs text-slate-500">Sin conciliar</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="hidden touch-pan-x overflow-x-auto [-webkit-overflow-scrolling:touch] md:block">
                <table className="w-full min-w-[min(100%,720px)] text-left text-sm">
                  <thead className="text-xs text-slate-500">
                    <tr className="border-b">
                      <th className="px-4 py-3">Sel</th>
                      <th className="py-3 pr-3">Fecha</th>
                      <th className="py-3 pr-3">Descripción</th>
                      <th className="py-3 pr-3">Monto</th>
                      <th className="py-3 pr-3">Categoría</th>
                      <th className="py-3 pr-3">Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.length === 0 ? (
                      <tr>
                        <td className="px-4 py-4 text-slate-500" colSpan={6}>
                          Sin datos.
                        </td>
                      </tr>
                    ) : (
                      movements.map((m) => (
                        <tr key={m.id} className="border-b last:border-b-0">
                          <td className="px-4 py-3">
                            <input
                              type="radio"
                              name="movement"
                              className="size-4 accent-ink-950"
                              checked={selectedMovementId === m.id}
                              onChange={() => setSelectedMovementId(m.id)}
                              disabled={Boolean(m.match)}
                            />
                          </td>
                          <td className="max-w-[10rem] break-words py-3 pr-3 text-xs text-slate-700">
                            {formatMxDateTime(m.date)}
                          </td>
                          <td className="py-3 pr-3 text-slate-700">{m.description}</td>
                          <td className="py-3 pr-3 font-mono text-xs text-slate-700">
                            {String(m.amount)}
                          </td>
                          <td className="py-3 pr-3">
                            <select
                              className="h-10 min-h-[40px] rounded-lg border bg-white px-2 text-xs md:h-8 md:min-h-0"
                              value={m.category ?? ""}
                              onChange={(e) => setMovementCategory(m.id, e.target.value || null)}
                              disabled={!m.match}
                              title={!m.match ? "Concílialo primero para categorizar" : "Categoría"}
                            >
                              <option value="">Sin categoría</option>
                              <option value="Ventas">Ventas</option>
                              <option value="Servicios">Servicios</option>
                              <option value="Nómina">Nómina</option>
                              <option value="Renta">Renta</option>
                              <option value="Impuestos">Impuestos</option>
                              <option value="Comisiones bancarias">Comisiones bancarias</option>
                              <option value="Proveedores">Proveedores</option>
                              <option value="Otros">Otros</option>
                            </select>
                          </td>
                          <td className="py-3 pr-3">
                            {m.match ? (
                              <button
                                type="button"
                                className="rounded-lg border px-3 py-2 text-xs md:px-2 md:py-1"
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
            </>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
            Estado de cuenta
          </div>
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <>
              <div className="md:hidden">
                {statements.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">Sin datos.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {statements.map((s) => (
                      <div key={s.id} className="space-y-3 p-4 [-webkit-tap-highlight-color:transparent]">
                        <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                          <input
                            type="radio"
                            name="statement"
                            className="size-5 shrink-0 accent-ink-950"
                            checked={selectedStatementId === s.id}
                            onChange={() => setSelectedStatementId(s.id)}
                            disabled={Boolean(s.match)}
                          />
                          <span>Seleccionar para conciliar</span>
                        </label>
                        <button
                          type="button"
                          className="btn-touch-outline"
                          onClick={() => {
                            setSelectedStatementForSuggest(s.id);
                            void Promise.resolve().then(suggest);
                          }}
                          disabled={Boolean(s.match)}
                        >
                          Sugerir match
                        </button>
                        <div className="grid gap-1 text-sm">
                          <div className="text-xs text-slate-500">Fecha</div>
                          <div className="text-slate-800">{formatMxDateTime(s.date)}</div>
                          <div className="text-xs text-slate-500">Descripción</div>
                          <div className="break-words text-slate-800">{s.description}</div>
                          <div className="text-xs text-slate-500">Monto</div>
                          <div className="font-mono text-sm">{String(s.amount)}</div>
                          <div className="text-xs text-slate-500">Match</div>
                          <div>
                            {s.match ? (
                              <span className="text-sm font-medium text-emerald-700">Conciliado</span>
                            ) : (
                              <span className="text-sm text-slate-500">—</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="hidden touch-pan-x overflow-x-auto [-webkit-overflow-scrolling:touch] md:block">
                <table className="w-full min-w-[min(100%,720px)] text-left text-sm">
                  <thead className="text-xs text-slate-500">
                    <tr className="border-b">
                      <th className="px-4 py-3">Sel</th>
                      <th className="py-3 pr-3">Sug.</th>
                      <th className="py-3 pr-3">Fecha</th>
                      <th className="py-3 pr-3">Descripción</th>
                      <th className="py-3 pr-3">Monto</th>
                      <th className="py-3 pr-3">Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statements.length === 0 ? (
                      <tr>
                        <td className="px-4 py-4 text-slate-500" colSpan={6}>
                          Sin datos.
                        </td>
                      </tr>
                    ) : (
                      statements.map((s) => (
                        <tr key={s.id} className="border-b last:border-b-0">
                          <td className="px-4 py-3">
                            <input
                              type="radio"
                              name="statement"
                              className="size-4 accent-ink-950"
                              checked={selectedStatementId === s.id}
                              onChange={() => setSelectedStatementId(s.id)}
                              disabled={Boolean(s.match)}
                            />
                          </td>
                          <td className="py-3 pr-3">
                            <button
                              type="button"
                              className="rounded-lg border px-3 py-2 text-xs disabled:opacity-60 md:px-2 md:py-1"
                              onClick={() => {
                                setSelectedStatementForSuggest(s.id);
                                void Promise.resolve().then(suggest);
                              }}
                              disabled={Boolean(s.match)}
                              title="Sugerir match"
                            >
                              Sugerir
                            </button>
                          </td>
                          <td className="max-w-[10rem] break-words py-3 pr-3 text-xs text-slate-700">
                            {formatMxDateTime(s.date)}
                          </td>
                          <td className="py-3 pr-3 text-slate-700">{s.description}</td>
                          <td className="py-3 pr-3 font-mono text-xs text-slate-700">
                            {String(s.amount)}
                          </td>
                          <td className="py-3 pr-3">
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
            </>
          )}
        </div>
      </div>

      {suggestions ? (
        <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Sugerencias de match</div>
              <div className="text-xs text-slate-600">Top 10 por monto/fecha (solo movimientos sin conciliar).</div>
            </div>
            <button type="button" className="btn-touch-outline shrink-0" onClick={() => setSuggestions(null)}>
              Cerrar
            </button>
          </div>
          <div className="mt-3">
            <div className="md:hidden">
              {suggestions.length === 0 ? (
                <div className="py-4 text-sm text-slate-500">Sin sugerencias.</div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                  {suggestions.map((m) => (
                    <div key={m.id} className="space-y-3 p-4">
                      <div className="font-mono text-xs text-slate-600">{m.id}</div>
                      <div className="grid gap-1 text-sm">
                        <div className="text-xs text-slate-500">Fecha</div>
                        <div>{formatMxDateTime(m.date)}</div>
                        <div className="text-xs text-slate-500">Descripción</div>
                        <div className="break-words">{m.description}</div>
                        <div className="text-xs text-slate-500">Monto / Tipo</div>
                        <div>
                          <span className="font-mono">{String(m.amount)}</span>{" "}
                          <span className="text-slate-600">{m.type}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-touch-primary"
                        onClick={() => {
                          if (!selectedStatementForSuggest) return;
                          void (async () => {
                            await matchPair(m.id, selectedStatementForSuggest);
                            setSuggestions(null);
                          })();
                        }}
                        disabled={!selectedStatementForSuggest}
                      >
                        Conciliar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden touch-pan-x overflow-x-auto [-webkit-overflow-scrolling:touch] md:block">
              <table className="w-full min-w-[min(100%,720px)] text-left text-sm">
                <thead className="text-xs text-slate-500">
                  <tr className="border-b">
                    <th className="px-4 py-3">ID</th>
                    <th className="py-3 pr-3">Fecha</th>
                    <th className="py-3 pr-3">Descripción</th>
                    <th className="py-3 pr-3">Monto</th>
                    <th className="py-3 pr-3">Tipo</th>
                    <th className="py-3 pr-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {suggestions.length === 0 ? (
                    <tr>
                      <td className="px-4 py-4 text-slate-500" colSpan={6}>
                        Sin sugerencias.
                      </td>
                    </tr>
                  ) : (
                    suggestions.map((m) => (
                      <tr key={m.id} className="border-b last:border-b-0">
                        <td className="px-4 py-3 font-mono text-xs text-slate-700">{m.id}</td>
                        <td className="max-w-[10rem] break-words py-3 pr-3 text-xs text-slate-700">
                          {formatMxDateTime(m.date)}
                        </td>
                        <td className="py-3 pr-3 text-slate-700">{m.description}</td>
                        <td className="py-3 pr-3 font-mono text-xs text-slate-700">{String(m.amount)}</td>
                        <td className="py-3 pr-3 text-slate-700">{m.type}</td>
                        <td className="py-3 pr-3">
                          <button
                            type="button"
                            className="rounded-lg border px-3 py-2 text-xs disabled:opacity-60 md:px-2 md:py-1"
                            onClick={() => {
                              if (!selectedStatementForSuggest) return;
                              void (async () => {
                                await matchPair(m.id, selectedStatementForSuggest);
                                setSuggestions(null);
                              })();
                            }}
                            disabled={!selectedStatementForSuggest}
                          >
                            Conciliar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

