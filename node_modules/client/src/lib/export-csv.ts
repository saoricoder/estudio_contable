/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

/** BOM UTF-8 para que Excel en Windows reconozca acentos en CSV. */
const UTF8_BOM = "\uFEFF";

function escapeCsvCell(value: unknown): string {
  const raw = value == null ? "" : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function downloadUtf8Csv(filename: string, csvBodyWithoutBom: string): void {
  const blob = new Blob([UTF8_BOM + csvBodyWithoutBom], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2_000);
}

export type ClientCsvRow = {
  id: string;
  name: string;
  rfc: string;
  regimen: string;
  email?: string | null;
  phone?: string | null;
};

/**
 * CSV de cartera de clientes (columnas estables para Excel / contabilidad).
 */
export function buildClientsCsv(rows: ClientCsvRow[]): string {
  const header = ["id", "nombre", "rfc", "regimen", "email", "telefono"];
  const lines = [
    header.map(escapeCsvCell).join(","),
    ...rows.map((r) =>
      [r.id, r.name, r.rfc, r.regimen, r.email ?? "", r.phone ?? ""]
        .map(escapeCsvCell)
        .join(","),
    ),
  ];
  return lines.join("\r\n");
}

/** Fila de factura recurrente para interoperabilidad con Excel / otros ERP. */
export type RecurringInvoiceCsvRow = {
  id: string;
  clientName: string;
  clientRfc: string;
  concept: string;
  amount: string | number;
  currency: string;
  frequency: string;
  paymentStatus: string;
  pendingBalance: string | number;
  nextRunDate: string;
  active: boolean | string;
};

export function buildRecurringInvoicesCsv(rows: RecurringInvoiceCsvRow[]): string {
  const header = [
    "id",
    "cliente",
    "rfc_cliente",
    "concepto",
    "monto",
    "moneda",
    "frecuencia",
    "estado_pago",
    "saldo_pendiente",
    "proxima_ejecucion",
    "activa",
  ];
  const lines = [
    header.map(escapeCsvCell).join(","),
    ...rows.map((r) =>
      [
        r.id,
        r.clientName,
        r.clientRfc,
        r.concept,
        r.amount,
        r.currency,
        r.frequency,
        r.paymentStatus,
        r.pendingBalance,
        r.nextRunDate,
        typeof r.active === "boolean" ? (r.active ? "si" : "no") : r.active,
      ]
        .map(escapeCsvCell)
        .join(","),
    ),
  ];
  return lines.join("\r\n");
}
