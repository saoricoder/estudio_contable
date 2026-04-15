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

export type FinancialHealthTrendPoint = {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
  net: number;
  matchedCount: number;
};

export type FinancialHealthTopMovement = {
  id: string;
  date: string;
  description: string;
  type: "CREDIT" | "DEBIT";
  amountAbs: number;
  category: string;
};

export type FinancialHealthDetails = FinancialHealthSummary & {
  trend3m: FinancialHealthTrendPoint[];
  topMovements: FinancialHealthTopMovement[];
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

  async details(params: { month: string }): Promise<FinancialHealthDetails> {
    const summary = await this.summarize(params);

    const trendMonths = prevMonthsInclusive(params.month, 3);
    const trend3m = await Promise.all(
      trendMonths.map(async (m) => {
        const s = await this.summarize({ month: m });
        return {
          month: m,
          income: s.income,
          expenses: s.expenses,
          net: s.net,
          matchedCount: s.matchedCount,
        };
      }),
    );

    const { start, end } = monthRange(params.month);
    const movements = await prisma.bankMovement.findMany({
      where: { date: { gte: start, lt: end }, match: { isNot: null } },
      select: { id: true, date: true, description: true, type: true, amount: true, category: true },
    });

    const topMovements = movements
      .map((m) => {
        const amountAbs = Math.abs(toNumber(m.amount));
        return {
          id: m.id,
          date: m.date.toISOString(),
          description: m.description,
          type: m.type,
          amountAbs: round2(amountAbs),
          category: (m.category ?? "Sin categoría").trim() || "Sin categoría",
        } as FinancialHealthTopMovement;
      })
      .sort((a, b) => b.amountAbs - a.amountAbs)
      .slice(0, 10);

    return { ...summary, trend3m, topMovements };
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

function prevMonthsInclusive(month: string, count: number) {
  // returns [older..month]
  const [y, m] = month.split("-").map(Number);
  const res: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
    d.setUTCMonth(d.getUTCMonth() - i);
    const yy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    res.push(`${yy}-${mm}`);
  }
  return res;
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

