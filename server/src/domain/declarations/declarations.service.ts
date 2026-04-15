import { prisma } from "../../config/prisma";

export class DeclarationsService {
  async list(params?: { clientId?: string; status?: string }) {
    return prisma.declaration.findMany({
      where: {
        clientId: params?.clientId,
        status: params?.status as any,
      },
      orderBy: [{ dueDate: "asc" }],
      include: { client: { select: { id: true, name: true, rfc: true } } },
    });
  }

  async create(input: {
    clientId: string;
    type: "PROVISIONAL" | "ANNUAL" | "PAYROLL" | "VAT";
    status: "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "PAID" | "OVERDUE";
    period: string;
    dueDate: string;
    filedAt?: string;
    notes?: string;
  }) {
    const client = await prisma.client.findUnique({
      where: { id: input.clientId },
      select: { id: true },
    });
    if (!client) {
      const err = new Error("Client not found");
      (err as any).status = 404;
      throw err;
    }

    try {
      return await prisma.declaration.create({
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
    } catch (e: any) {
      if (e?.code === "P2002") {
        const err = new Error("Declaration already exists for client/type/period");
        (err as any).status = 409;
        throw err;
      }
      throw e;
    }
  }

  async update(
    id: string,
    input: Partial<{
      type: "PROVISIONAL" | "ANNUAL" | "PAYROLL" | "VAT";
      status: "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "PAID" | "OVERDUE";
      period: string;
      dueDate: string;
      filedAt?: string;
      notes?: string;
    }>,
  ) {
    const existing = await prisma.declaration.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      const err = new Error("Declaration not found");
      (err as any).status = 404;
      throw err;
    }

    return prisma.declaration.update({
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
    const totals = await prisma.declaration.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    const upcoming = await prisma.declaration.findMany({
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

  async remove(id: string) {
    const existing = await prisma.declaration.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      const err = new Error("Declaration not found");
      (err as any).status = 404;
      throw err;
    }
    await prisma.declaration.delete({ where: { id } });
    return { ok: true };
  }
}

