import { useEffect, useState } from "react";
import { apiGet, apiPost, authHeader } from "../lib/api";

export function BankingPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [statements, setStatements] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(null);
  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(null);

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
    try {
      const [mRes, sRes] = await Promise.all([
        apiGet<{ data: any[] }>(`/api/banking/movements`),
        apiGet<{ data: any[] }>(`/api/banking/statements`),
      ]);
      setMovements(mRes.data);
      setStatements(sRes.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
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
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
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
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function matchSelected() {
    if (!selectedMovementId || !selectedStatementId) return;
    setError(null);
    try {
      await apiPost(`/api/banking/match`, {
        movementId: selectedMovementId,
        statementLineId: selectedStatementId,
      });
      setSelectedMovementId(null);
      setSelectedStatementId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
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
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
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
            <div className="text-lg font-semibold text-slate-900">Conciliación bancaria</div>
            <div className="text-sm text-slate-600">Alta y match manual 1:1.</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 rounded-xl border px-3 text-sm" onClick={load}>
              Cargar
            </button>
            <button
              className="h-9 rounded-xl bg-ink-950 px-3 text-sm font-medium text-white disabled:opacity-60"
              onClick={matchSelected}
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
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <input
                className="h-10 rounded-xl border px-3 text-sm font-mono"
                value={newMovement.date}
                onChange={(e) => setNewMovement({ ...newMovement, date: e.target.value })}
              />
              <select
                className="h-10 rounded-xl border bg-white px-3 text-sm"
                value={newMovement.type}
                onChange={(e) => setNewMovement({ ...newMovement, type: e.target.value })}
              >
                <option value="CREDIT">CREDIT</option>
                <option value="DEBIT">DEBIT</option>
              </select>
              <input
                className="h-10 rounded-xl border px-3 text-sm md:col-span-2"
                value={newMovement.description}
                onChange={(e) =>
                  setNewMovement({ ...newMovement, description: e.target.value })
                }
              />
              <input
                className="h-10 rounded-xl border px-3 text-sm"
                value={newMovement.reference}
                onChange={(e) =>
                  setNewMovement({ ...newMovement, reference: e.target.value })
                }
                placeholder="Referencia (opcional)"
              />
              <input
                className="h-10 rounded-xl border px-3 text-sm"
                type="number"
                value={newMovement.amount}
                onChange={(e) =>
                  setNewMovement({ ...newMovement, amount: Number(e.target.value) })
                }
              />
              <button
                className="h-10 rounded-xl bg-ink-950 px-3 text-sm font-medium text-white md:col-span-2"
                onClick={createMovement}
              >
                Crear movimiento
              </button>
            </div>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Nueva línea (Estado de cuenta)</div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <input
                className="h-10 rounded-xl border px-3 text-sm font-mono"
                value={newStatement.date}
                onChange={(e) => setNewStatement({ ...newStatement, date: e.target.value })}
              />
              <select
                className="h-10 rounded-xl border bg-white px-3 text-sm"
                value={newStatement.type}
                onChange={(e) => setNewStatement({ ...newStatement, type: e.target.value })}
              >
                <option value="CREDIT">CREDIT</option>
                <option value="DEBIT">DEBIT</option>
              </select>
              <input
                className="h-10 rounded-xl border px-3 text-sm md:col-span-2"
                value={newStatement.description}
                onChange={(e) =>
                  setNewStatement({ ...newStatement, description: e.target.value })
                }
              />
              <input
                className="h-10 rounded-xl border px-3 text-sm"
                value={newStatement.reference}
                onChange={(e) =>
                  setNewStatement({ ...newStatement, reference: e.target.value })
                }
                placeholder="Referencia (opcional)"
              />
              <input
                className="h-10 rounded-xl border px-3 text-sm"
                type="number"
                value={newStatement.amount}
                onChange={(e) =>
                  setNewStatement({ ...newStatement, amount: Number(e.target.value) })
                }
              />
              <button
                className="h-10 rounded-xl bg-ink-950 px-3 text-sm font-medium text-white md:col-span-2"
                onClick={createStatement}
              >
                Crear línea
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <div className="border-b bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
            Movimientos (Libro)
          </div>
          <table className="w-full min-w-[760px] text-left text-sm">
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
                        checked={selectedMovementId === m.id}
                        onChange={() => setSelectedMovementId(m.id)}
                        disabled={Boolean(m.match)}
                      />
                    </td>
                    <td className="py-3 pr-3 font-mono text-xs text-slate-700">
                      {String(m.date)}
                    </td>
                    <td className="py-3 pr-3 text-slate-700">{m.description}</td>
                    <td className="py-3 pr-3 font-mono text-xs text-slate-700">
                      {String(m.amount)}
                    </td>
                    <td className="py-3 pr-3">
                      <select
                        className="h-8 rounded-lg border bg-white px-2 text-xs"
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

        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <div className="border-b bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
            Estado de cuenta
          </div>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr className="border-b">
                <th className="px-4 py-3">Sel</th>
                <th className="py-3 pr-3">Fecha</th>
                <th className="py-3 pr-3">Descripción</th>
                <th className="py-3 pr-3">Monto</th>
                <th className="py-3 pr-3">Match</th>
              </tr>
            </thead>
            <tbody>
              {statements.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={5}>
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
                        checked={selectedStatementId === s.id}
                        onChange={() => setSelectedStatementId(s.id)}
                        disabled={Boolean(s.match)}
                      />
                    </td>
                    <td className="py-3 pr-3 font-mono text-xs text-slate-700">
                      {String(s.date)}
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
      </div>
    </div>
  );
}

