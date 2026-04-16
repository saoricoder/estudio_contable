/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse space-y-2 p-4">
      <div className="flex gap-2">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 flex-1 rounded bg-slate-200" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-2">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-8 flex-1 rounded bg-slate-100" />
          ))}
        </div>
      ))}
    </div>
  );
}
