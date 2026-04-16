/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import type { ReactNode } from "react";

export type StackColumn<T> = {
  key: string;
  label: string;
  /** Contenido en vista móvil (tarjeta) */
  mobile: (row: T) => ReactNode;
  /** Contenido en vista escritorio (celda) */
  desktop: (row: T) => ReactNode;
  /** className opcional para <td> en escritorio */
  desktopCellClassName?: string;
  /** className opcional para <th> */
  headerClassName?: string;
};

type ResponsiveStackTableProps<T> = {
  columns: StackColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyLabel?: string;
  /** Clase min-width de la tabla en md+ (scroll horizontal táctil) */
  tableMinWidthClass?: string;
};

/**
 * Vista móvil: filas como tarjetas apiladas (44px+ táctil en acciones externas).
 * Vista md+: tabla con scroll horizontal suave.
 */
export function ResponsiveStackTable<T>({
  columns,
  rows,
  rowKey,
  emptyLabel = "Sin datos.",
  tableMinWidthClass = "min-w-[640px]",
}: ResponsiveStackTableProps<T>) {
  return (
    <>
      <div className="md:hidden divide-y divide-slate-100">
        {rows.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">{emptyLabel}</div>
        ) : (
          rows.map((row) => (
            <article
              key={rowKey(row)}
              className="space-y-3 p-4 [-webkit-tap-highlight-color:transparent]"
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0"
                >
                  <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500">
                    {col.label}
                  </span>
                  <div className="min-w-0 max-w-[65%] text-right text-sm text-slate-900">
                    {col.mobile(row)}
                  </div>
                </div>
              ))}
            </article>
          ))
        )}
      </div>

      <div className="hidden md:block touch-pan-x overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <table className={`w-full text-left text-sm ${tableMinWidthClass}`}>
          <thead className="text-xs text-slate-500">
            <tr className="border-b">
              {columns.map((col, idx) => (
                <th
                  key={col.key}
                  className={[
                    "py-3 pr-3 font-medium",
                    idx === 0 ? "pl-4" : "",
                    col.headerClassName ?? "",
                  ].join(" ")}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={columns.length}>
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)} className="border-b last:border-b-0">
                  {columns.map((col, idx) => (
                    <td
                      key={col.key}
                      className={[
                        "py-3 pr-3 align-top",
                        idx === 0 ? "pl-4" : "",
                        col.desktopCellClassName ?? "",
                      ].join(" ")}
                    >
                      {col.desktop(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
