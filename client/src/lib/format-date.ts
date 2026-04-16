/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

/** Para inputs `type="datetime-local"` (valor ISO → `YYYY-MM-DDTHH:mm`). */
export function isoToDatetimeLocal(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 16);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Desde `datetime-local` hacia ISO para el backend. */
export function datetimeLocalToIso(local: string): string {
  if (!local?.trim()) return new Date().toISOString();
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/** Fecha/hora legible en tablas (evita cadenas ISO largas). */
export function formatMxDateTime(value: unknown): string {
  if (value == null || value === "") return "—";
  const d = new Date(value as string | number);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
