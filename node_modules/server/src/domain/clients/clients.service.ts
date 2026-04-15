/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { prisma } from "../../config/prisma";

export class ClientsService {
  async list() {
    return prisma.client.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id: string) {
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      const err = new Error("Client not found");
      (err as any).status = 404;
      throw err;
    }
    return client;
  }

  async create(input: {
    name: string;
    rfc: string;
    regimen: string;
    email?: string;
    phone?: string;
  }) {
    try {
      return await prisma.client.create({ data: input });
    } catch (e: any) {
      // Prisma unique constraint (rfc)
      if (e?.code === "P2002") {
        const err = new Error("RFC already exists");
        (err as any).status = 409;
        throw err;
      }
      throw e;
    }
  }

  async update(id: string, input: Partial<{ name: string; rfc: string; regimen: string; email?: string; phone?: string }>) {
    await this.getById(id);
    try {
      return await prisma.client.update({ where: { id }, data: input });
    } catch (e: any) {
      if (e?.code === "P2002") {
        const err = new Error("RFC already exists");
        (err as any).status = 409;
        throw err;
      }
      throw e;
    }
  }

  async remove(id: string) {
    await this.getById(id);
    await prisma.client.delete({ where: { id } });
    return { ok: true };
  }
}

