import { prisma } from "../../config/prisma";

export type FinancialHealthSummary = {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
  net: number;
  matchedCount: number;
  byCategory: Array<{
    category: string;
    income: number;
    expenses: number;
    net: number;
  }>;
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
      select: { amount: true, type: true, category: true },
    });

    let income = 0;
    let expenses = 0;
    const cat = new Map<string, { income: number; expenses: number }>();

    for (const m of matched) {
      const amount = toNumber(m.amount);
      const key = (m.category ?? "Sin categoría").trim() || "Sin categoría";
      const agg = cat.get(key) ?? { income: 0, expenses: 0 };

      if (m.type === "CREDIT") {
        const v = Math.abs(amount);
        income += v;
        agg.income += v;
      } else {
        const v = Math.abs(amount);
        expenses += v;
        agg.expenses += v;
      }

      cat.set(key, agg);
    }

    income = round2(income);
    expenses = round2(expenses);

    return {
      month: params.month,
      income,
      expenses,
      net: round2(income - expenses),
      matchedCount: matched.length,
      byCategory: [...cat.entries()]
        .map(([category, v]) => ({
          category,
          income: round2(v.income),
          expenses: round2(v.expenses),
          net: round2(v.income - v.expenses),
        }))
        .sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
        .slice(0, 8),
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

