"use strict";
/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeclarationsService = void 0;
const prisma_1 = require("../../config/prisma");
class DeclarationsService {
    async list(params) {
        return prisma_1.prisma.declaration.findMany({
            where: {
                clientId: params?.clientId,
                status: params?.status,
            },
            orderBy: [{ dueDate: "asc" }],
            include: { client: { select: { id: true, name: true, rfc: true } } },
        });
    }
    async create(input) {
        const client = await prisma_1.prisma.client.findUnique({
            where: { id: input.clientId },
            select: { id: true },
        });
        if (!client) {
            const err = new Error("Client not found");
            err.status = 404;
            throw err;
        }
        try {
            return await prisma_1.prisma.declaration.create({
                data: {
                    clientId: input.clientId,
                    type: input.type,
                    status: input.status,
                    period: input.period,
                    dueDate: new Date(input.dueDate),
                    filedAt: input.filedAt ? new Date(input.filedAt) : undefined,
                    notes: input.notes,
                },
                include: { client: { select: { id: true, name: true, rfc: true } } },
            });
        }
        catch (e) {
            if (e?.code === "P2002") {
                const err = new Error("Declaration already exists for client/type/period");
                err.status = 409;
                throw err;
            }
            throw e;
        }
    }
    async update(id, input) {
        const existing = await prisma_1.prisma.declaration.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            const err = new Error("Declaration not found");
            err.status = 404;
            throw err;
        }
        return prisma_1.prisma.declaration.update({
            where: { id },
            data: {
                ...input,
                dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
                filedAt: input.filedAt ? new Date(input.filedAt) : undefined,
            },
            include: { client: { select: { id: true, name: true, rfc: true } } },
        });
    }
    async dashboard() {
        const totals = await prisma_1.prisma.declaration.groupBy({
            by: ["status"],
            _count: { _all: true },
        });
        const upcoming = await prisma_1.prisma.declaration.findMany({
            where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
            orderBy: { dueDate: "asc" },
            take: 10,
            include: { client: { select: { id: true, name: true, rfc: true } } },
        });
        return {
            totals: totals.map((t) => ({ status: t.status, count: t._count._all })),
            upcoming,
        };
    }
    async remove(id) {
        const existing = await prisma_1.prisma.declaration.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            const err = new Error("Declaration not found");
            err.status = 404;
            throw err;
        }
        await prisma_1.prisma.declaration.delete({ where: { id } });
        return { ok: true };
    }
}
exports.DeclarationsService = DeclarationsService;
