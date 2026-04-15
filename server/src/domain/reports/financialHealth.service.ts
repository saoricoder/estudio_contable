import { prisma } from "../../config/prisma";

export type FinancialHealthSummary = {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
  net: number;
  matchedCount: number;
};

export class FinancialHealthService {
  async summarize(params: { month: string }) : Promise<FinancialHealthSummary> {
    const { start, end } = monthRange(params.month);

    // MVP: usamos movimientos internos conciliados (match != null)
    const matched = await prisma.bankMovement.findMany({
      where: {
        date: { gte: start, lt: end },
        match: { isNot: null },
      },
      select: { amount: true, type: true },
    });

    let income = 0;
    let expenses = 0;

    for (const m of matched) {
      const amount = toNumber(m.amount);
      if (m.type === "CREDIT") income += Math.abs(amount);
      else expenses += Math.abs(amount);
    }

    income = round2(income);
    expenses = round2(expenses);

    return {
      month: params.month,
      income,
      expenses,
      net: round2(income - expenses),
      matchedCount: matched.length,
    };
  }
}

function monthRange(month: string) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    const err = new Error("Invalid month format (YYYY-MM)");
    (err as any).status = 400;
    throw err;
  }
  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { start, end };
}

function toNumber(v: any): number {
  // Prisma Decimal serializa a string en JSON; runtime suele ser Decimal-like con toString()
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  if (v && typeof v.toString === "function") return Number(v.toString());
  return Number(v);
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

