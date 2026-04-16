"use strict";
/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const prisma_1 = require("../../config/prisma");
const FISCAL_YEAR = 2026;
class AnalyticsService {
    async dashboard() {
        const yearStart = new Date(Date.UTC(FISCAL_YEAR, 0, 1, 0, 0, 0));
        const yearEnd = new Date(Date.UTC(FISCAL_YEAR + 1, 0, 1, 0, 0, 0));
        const credits = await prisma_1.prisma.bankMovement.findMany({
            where: {
                date: { gte: yearStart, lt: yearEnd },
                type: "CREDIT",
                match: { isNot: null },
            },
            select: { amount: true, date: true },
        });
        const monthKeys = Array.from({ length: 12 }, (_, i) => {
            const mm = String(i + 1).padStart(2, "0");
            return `${FISCAL_YEAR}-${mm}`;
        });
        const incomeMap = new Map(monthKeys.map((k) => [k, 0]));
        for (const m of credits) {
            const d = new Date(m.date);
            const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
            if (!incomeMap.has(key))
                continue;
            incomeMap.set(key, (incomeMap.get(key) ?? 0) + Math.abs(Number(m.amount.toString())));
        }
        const declarations = await prisma_1.prisma.declaration.findMany({
            where: { period: { startsWith: String(FISCAL_YEAR) } },
            select: { period: true, status: true },
        });
        const declMap = new Map();
        for (const mk of monthKeys) {
            declMap.set(mk, { PENDING: 0, IN_PROGRESS: 0, SUBMITTED: 0, PAID: 0, OVERDUE: 0 });
        }
        for (const d of declarations) {
            const row = declMap.get(d.period);
            if (!row)
                continue;
            const st = d.status;
            row[st] = (row[st] ?? 0) + 1;
        }
        const grouped = await prisma_1.prisma.recurringInvoice.groupBy({
            by: ["paymentStatus"],
            _count: { _all: true },
        });
        let paid = 0;
        let pending = 0;
        for (const g of grouped) {
            if (g.paymentStatus === "PAID")
                paid = g._count._all;
            else
                pending += g._count._all;
        }
        return {
            fiscalYear: FISCAL_YEAR,
            incomeByMonth: monthKeys.map((month) => ({
                month,
                income: round2(incomeMap.get(month) ?? 0),
            })),
            declarationsByMonth: monthKeys.map((month) => ({
                month,
                byStatus: declMap.get(month),
            })),
            invoicePie: { paid, pending },
        };
    }
}
exports.AnalyticsService = AnalyticsService;
function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}
