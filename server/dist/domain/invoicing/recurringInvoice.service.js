"use strict";
/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringInvoiceService = void 0;
const prisma_1 = require("../../config/prisma");
class RecurringInvoiceService {
    async list() {
        return prisma_1.prisma.recurringInvoice.findMany({
            orderBy: { createdAt: "desc" },
            include: { client: { select: { id: true, name: true, rfc: true } } },
        });
    }
    async create(input) {
        // Ensure client exists
        const client = await prisma_1.prisma.client.findUnique({ where: { id: input.clientId }, select: { id: true } });
        if (!client) {
            const err = new Error("Client not found");
            err.status = 404;
            throw err;
        }
        return prisma_1.prisma.recurringInvoice.create({
            data: {
                clientId: input.clientId,
                concept: input.concept,
                amount: input.amount, // Prisma Decimal accepts number at runtime
                pendingBalance: input.amount,
                paymentStatus: "PENDING",
                currency: input.currency,
                frequency: input.frequency,
                startDate: new Date(input.startDate),
                nextRunDate: new Date(input.nextRunDate),
                active: input.active,
            },
            include: { client: { select: { id: true, name: true, rfc: true } } },
        });
    }
    async update(id, input) {
        const existing = await prisma_1.prisma.recurringInvoice.findUnique({
            where: { id },
            select: { id: true, paymentStatus: true },
        });
        if (!existing) {
            const err = new Error("Recurring invoice not found");
            err.status = 404;
            throw err;
        }
        const pendingBalance = input.amount != null && existing.paymentStatus !== "PAID"
            ? input.amount
            : undefined;
        return prisma_1.prisma.recurringInvoice.update({
            where: { id },
            data: {
                ...input,
                amount: input.amount == null ? undefined : input.amount,
                pendingBalance,
                startDate: input.startDate == null ? undefined : new Date(input.startDate),
                nextRunDate: input.nextRunDate == null ? undefined : new Date(input.nextRunDate),
            },
            include: { client: { select: { id: true, name: true, rfc: true } } },
        });
    }
    async remove(id) {
        const existing = await prisma_1.prisma.recurringInvoice.findUnique({ where: { id }, select: { id: true } });
        if (!existing) {
            const err = new Error("Recurring invoice not found");
            err.status = 404;
            throw err;
        }
        await prisma_1.prisma.recurringInvoice.delete({ where: { id } });
        return { ok: true };
    }
}
exports.RecurringInvoiceService = RecurringInvoiceService;
