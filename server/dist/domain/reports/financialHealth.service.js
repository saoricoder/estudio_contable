"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialHealthService = void 0;
const prisma_1 = require("../../config/prisma");
class FinancialHealthService {
    async summarize(params) {
        const { start, end } = monthRange(params.month);
        // MVP: usamos movimientos internos conciliados (match != null)
        const matched = await prisma_1.prisma.bankMovement.findMany({
            where: {
                date: { gte: start, lt: end },
                match: { isNot: null },
            },
            select: { amount: true, type: true, category: true },
        });
        let income = 0;
        let expenses = 0;
        const cat = new Map();
        for (const m of matched) {
            const amount = toNumber(m.amount);
            const key = (m.category ?? "Sin categoría").trim() || "Sin categoría";
            const agg = cat.get(key) ?? { income: 0, expenses: 0 };
            if (m.type === "CREDIT") {
                const v = Math.abs(amount);
                income += v;
                agg.income += v;
            }
            else {
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
exports.FinancialHealthService = FinancialHealthService;
function monthRange(month) {
    if (!/^\d{4}-\d{2}$/.test(month)) {
        const err = new Error("Invalid month format (YYYY-MM)");
        err.status = 400;
        throw err;
    }
    const [y, m] = month.split("-").map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
    return { start, end };
}
function toNumber(v) {
    // Prisma Decimal serializa a string en JSON; runtime suele ser Decimal-like con toString()
    if (typeof v === "number")
        return v;
    if (typeof v === "string")
        return Number(v);
    if (v && typeof v.toString === "function")
        return Number(v.toString());
    return Number(v);
}
function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}
