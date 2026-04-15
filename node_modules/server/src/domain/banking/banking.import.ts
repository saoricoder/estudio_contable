import Papa from "papaparse";

export type ImportedStatementRow = {
  date: string; // ISO datetime
  description: string;
  reference?: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
};

export function parseStatementCsv(params: { csv: string }) {
  const parsed = Papa.parse<Record<string, string>>(params.csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (parsed.errors?.length) {
    const err = new Error(`CSV parse error: ${parsed.errors[0].message}`);
    (err as any).status = 400;
    throw err;
  }

  const rows = (parsed.data ?? []).map((r) => normalizeRow(r)).filter(Boolean) as ImportedStatementRow[];
  if (rows.length === 0) {
    const err = new Error("CSV vacío o sin columnas válidas");
    (err as any).status = 400;
    throw err;
  }
  return rows;
}

function normalizeRow(r: Record<string, string>): ImportedStatementRow | null {
  // Columnas esperadas (flexibles):
  // date|fecha, description|descripcion|concepto, reference|ref, amount|importe|monto, type|tipo|cargo_abono
  const dateRaw = pick(r, ["date", "fecha"]);
  const desc = pick(r, ["description", "descripcion", "concepto", "detalle"]);
  const ref = pick(r, ["reference", "ref", "referencia"]);
  const amountRaw = pick(r, ["amount", "importe", "monto"]);
  const typeRaw = pick(r, ["type", "tipo", "cargo_abono", "naturaleza"]);

  if (!dateRaw || !desc || !amountRaw) return null;

  const amount = Number(String(amountRaw).replace(/[, ]/g, ""));
  if (!Number.isFinite(amount)) return null;

  const type = normalizeType(typeRaw, amount);
  const date = normalizeDate(dateRaw);

  return {
    date,
    description: String(desc).trim(),
    reference: ref ? String(ref).trim() : undefined,
    amount,
    type,
  };
}

function pick(obj: Record<string, string>, keys: string[]) {
  for (const k of keys) {
    if (obj[k] != null && String(obj[k]).trim() !== "") return obj[k];
  }
  return undefined;
}

function normalizeType(typeRaw: unknown, amount: number): "CREDIT" | "DEBIT" {
  const t = String(typeRaw ?? "").trim().toLowerCase();
  if (t === "credit" || t === "abono" || t === "c" || t === "+") return "CREDIT";
  if (t === "debit" || t === "cargo" || t === "d" || t === "-") return "DEBIT";
  // fallback por signo
  return amount >= 0 ? "CREDIT" : "DEBIT";
}

function normalizeDate(dateRaw: unknown) {
  // Intento: ISO, o dd/mm/yyyy
  const s = String(dateRaw).trim();
  const iso = new Date(s);
  if (!Number.isNaN(iso.getTime())) return iso.toISOString();

  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yy = Number(m[3]);
    return new Date(Date.UTC(yy, mm - 1, dd, 0, 0, 0)).toISOString();
  }

  const err = new Error(`Fecha inválida: ${s}`);
  (err as any).status = 400;
  throw err;
}

