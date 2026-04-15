"use strict";
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
        // MVP: no obligamos a que monto/fecha coincidan, solo se marca manualmente.
        return prisma_1.prisma.bankReconciliationMatch.create({
            data: {
                movementId: params.movementId,
                statementLineId: params.statementLineId,
            },
            include: { movement: true, statementLine: true },
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
