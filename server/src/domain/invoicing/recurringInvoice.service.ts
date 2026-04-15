import { prisma } from "../../config/prisma";

export class RecurringInvoiceService {
  async list() {
    return prisma.recurringInvoice.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: { select: { id: true, name: true, rfc: true } } },
    });
  }

  async create(input: {
    clientId: string;
    concept: string;
    amount: number;
    currency: string;
    frequency: "MONTHLY" | "BIMONTHLY" | "QUARTERLY" | "YEARLY";
    startDate: string;
    nextRunDate: string;
    active: boolean;
  }) {
    // Ensure client exists
    const client = await prisma.client.findUnique({ where: { id: input.clientId }, select: { id: true } });
    if (!client) {
      const err = new Error("Client not found");
      (err as any).status = 404;
      throw err;
    }

    return prisma.recurringInvoice.create({
      data: {
        clientId: input.clientId,
        concept: input.concept,
        amount: input.amount as any, // Prisma Decimal accepts number at runtime
        currency: input.currency,
        frequency: input.frequency,
        startDate: new Date(input.startDate),
        nextRunDate: new Date(input.nextRunDate),
        active: input.active,
      },
      include: { client: { select: { id: true, name: true, rfc: true } } },
    });
  }

  async update(
    id: string,
    input: Partial<{
      concept: string;
      amount: number;
      currency: string;
      frequency: "MONTHLY" | "BIMONTHLY" | "QUARTERLY" | "YEARLY";
      startDate: string;
      nextRunDate: string;
      active: boolean;
    }>,
  ) {
    const existing = await prisma.recurringInvoice.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      const err = new Error("Recurring invoice not found");
      (err as any).status = 404;
      throw err;
    }

    return prisma.recurringInvoice.update({
      where: { id },
      data: {
        ...input,
        amount: input.amount == null ? undefined : (input.amount as any),
        startDate: input.startDate == null ? undefined : new Date(input.startDate),
        nextRunDate: input.nextRunDate == null ? undefined : new Date(input.nextRunDate),
      },
      include: { client: { select: { id: true, name: true, rfc: true } } },
    });
  }

  async remove(id: string) {
    const existing = await prisma.recurringInvoice.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      const err = new Error("Recurring invoice not found");
      (err as any).status = 404;
      throw err;
    }
    await prisma.recurringInvoice.delete({ where: { id } });
    return { ok: true };
  }
}

