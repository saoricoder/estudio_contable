"use strict";
/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
const prisma_1 = require("../../config/prisma");
class ClientsService {
    async list() {
        return prisma_1.prisma.client.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
    async getById(id) {
        const client = await prisma_1.prisma.client.findUnique({ where: { id } });
        if (!client) {
            const err = new Error("Client not found");
            err.status = 404;
            throw err;
        }
        return client;
    }
    async create(input) {
        try {
            return await prisma_1.prisma.client.create({ data: input });
        }
        catch (e) {
            // Prisma unique constraint (rfc)
            if (e?.code === "P2002") {
                const err = new Error("RFC already exists");
                err.status = 409;
                throw err;
            }
            throw e;
        }
    }
    async update(id, input) {
        await this.getById(id);
        try {
            return await prisma_1.prisma.client.update({ where: { id }, data: input });
        }
        catch (e) {
            if (e?.code === "P2002") {
                const err = new Error("RFC already exists");
                err.status = 409;
                throw err;
            }
            throw e;
        }
    }
    async remove(id) {
        await this.getById(id);
        await prisma_1.prisma.client.delete({ where: { id } });
        return { ok: true };
    }
}
exports.ClientsService = ClientsService;
