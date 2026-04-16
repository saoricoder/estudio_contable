"use strict";
/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingService = void 0;
const prisma_1 = require("../../config/prisma");
class BankingService {
    async listMovements() {
        return prisma_1.prisma.bankMovement.findMany({
            orderBy: { date: "desc" },
            include: { match: { include: { statementLine: true } } },
        });
    }
    async listStatements() {
        return prisma_1.prisma.bankStatementLine.findMany({
            orderBy: { date: "desc" },
            include: { match: { include: { movement: true } } },
        });
    }
    async createMovement(input) {
        return prisma_1.prisma.bankMovement.create({
            data: {
                date: new Date(input.date),
                description: input.description,
                reference: input.reference,
                amount: input.amount,
                type: input.type,
                source: "BOOK",
            },
        });
    }
    async createStatementLine(input) {
        return prisma_1.prisma.bankStatementLine.create({
            data: {
                date: new Date(input.date),
                description: input.description,
                reference: input.reference,
                amount: input.amount,
                type: input.type,
                source: "BANK",
            },
        });
    }
    async importStatementLines(rows) {
        // MVP: importación simple sin deduplicación sofisticada.
        const created = await prisma_1.prisma.bankStatementLine.createMany({
            data: rows.map((r) => ({
                date: new Date(r.date),
                description: r.description,
                reference: r.reference,
                amount: r.amount,
                type: r.type,
                source: "BANK",
            })),
            skipDuplicates: false,
        });
        return { inserted: created.count };
    }
    async suggestMatches(params) {
        const statement = await prisma_1.prisma.bankStatementLine.findUnique({
            where: { id: params.statementLineId },
            include: { match: true },
        });
        if (!statement) {
            const err = new Error("Statement line not found");
            err.status = 404;
            throw err;
        }
        if (statement.match) {
            const err = new Error("Statement line already matched");
            err.status = 409;
            throw err;
        }
        const targetAmount = Number(statement.amount.toString());
        const start = new Date(statement.date);
        const end = new Date(statement.date);
        start.setUTCDate(start.getUTCDate() - params.maxDaysDiff);
        end.setUTCDate(end.getUTCDate() + params.maxDaysDiff);
        const candidates = await prisma_1.prisma.bankMovement.findMany({
            where: {
                match: { is: null },
                date: { gte: start, lte: end },
            },
            select: { id: true, date: true, description: true, amount: true, type: true, category: true },
            take: 50,
        });
        const ranked = candidates
            .map((m) => {
            const amt = Number(m.amount.toString());
            const diff = Math.abs(Math.abs(amt) - Math.abs(targetAmount));
            const dayDiff = Math.abs(Math.floor((new Date(m.date).getTime() - new Date(statement.date).getTime()) / (24 * 60 * 60 * 1000)));
            const score = diff * 10 + dayDiff; // prioriza monto
            return { ...m, score };
        })
            .sort((a, b) => a.score - b.score)
            .slice(0, 10);
        return {
            statementLine: statement,
            suggestions: ranked,
        };
    }
    async match(params) {
        const movement = await prisma_1.prisma.bankMovement.findUnique({
            where: { id: params.movementId },
            include: { match: true },
        });
        if (!movement) {
            const err = new Error("Movement not found");
            err.status = 404;
            throw err;
        }
        if (movement.match) {
            const err = new Error("Movement already matched");
            err.status = 409;
            throw err;
        }
        const statement = await prisma_1.prisma.bankStatementLine.findUnique({
            where: { id: params.statementLineId },
            include: { match: true },
        });
        if (!statement) {
            const err = new Error("Statement line not found");
            err.status = 404;
            throw err;
        }
        if (statement.match) {
            const err = new Error("Statement line already matched");
            err.status = 409;
            throw err;
        }
        return prisma_1.prisma.$transaction(async (tx) => {
            const row = await tx.bankReconciliationMatch.create({
                data: {
                    movementId: params.movementId,
                    statementLineId: params.statementLineId,
                },
                include: { movement: true, statementLine: true },
            });
            let markedInvoiceId = null;
            if (row.movement.type === "CREDIT") {
                const creditAmt = roundMoney(Math.abs(Number(row.movement.amount.toString())));
                const candidates = await tx.recurringInvoice.findMany({
                    where: {
                        paymentStatus: { in: ["PENDING", "OVERDUE"] },
                    },
                    orderBy: { nextRunDate: "asc" },
                });
                for (const inv of candidates) {
                    const bal = roundMoney(Number(inv.pendingBalance.toString()));
                    if (amountsMatchInvoicePayment(bal, creditAmt)) {
                        await tx.recurringInvoice.update({
                            where: { id: inv.id },
                            data: { paymentStatus: "PAID", pendingBalance: 0 },
                        });
                        markedInvoiceId = inv.id;
                        break;
                    }
                }
            }
            return {
                match: row,
                invoiceMarkedPaid: markedInvoiceId !== null,
                markedInvoiceId,
            };
        });
    }
    async unmatchByMovement(movementId) {
        const match = await prisma_1.prisma.bankReconciliationMatch.findUnique({
            where: { movementId },
            select: { id: true },
        });
        if (!match) {
            const err = new Error("Match not found for movement");
            err.status = 404;
            throw err;
        }
        await prisma_1.prisma.bankReconciliationMatch.delete({ where: { id: match.id } });
        return { ok: true };
    }
    async setMovementCategory(params) {
        const existing = await prisma_1.prisma.bankMovement.findUnique({
            where: { id: params.movementId },
            select: { id: true },
        });
        if (!existing) {
            const err = new Error("Movement not found");
            err.status = 404;
            throw err;
        }
        return prisma_1.prisma.bankMovement.update({
            where: { id: params.movementId },
            data: { category: params.category },
        });
    }
}
exports.BankingService = BankingService;
function roundMoney(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}
/** Saldo pendiente vs monto del abono (conciliación 1:1). */
function amountsMatchInvoicePayment(pending, credit) {
    return Math.abs(pending - credit) <= 0.01;
}
