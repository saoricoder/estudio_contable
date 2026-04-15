import { prisma } from "../../config/prisma";

export class BankingService {
  async listMovements() {
    return prisma.bankMovement.findMany({
      orderBy: { date: "desc" },
      include: { match: { include: { statementLine: true } } },
    });
  }

  async listStatements() {
    return prisma.bankStatementLine.findMany({
      orderBy: { date: "desc" },
      include: { match: { include: { movement: true } } },
    });
  }

  async createMovement(input: {
    date: string;
    description: string;
    reference?: string;
    amount: number;
    type: "CREDIT" | "DEBIT";
  }) {
    return prisma.bankMovement.create({
      data: {
        date: new Date(input.date),
        description: input.description,
        reference: input.reference,
        amount: input.amount as any,
        type: input.type,
        source: "BOOK",
      },
    });
  }

  async createStatementLine(input: {
    date: string;
    description: string;
    reference?: string;
    amount: number;
    type: "CREDIT" | "DEBIT";
  }) {
    return prisma.bankStatementLine.create({
      data: {
        date: new Date(input.date),
        description: input.description,
        reference: input.reference,
        amount: input.amount as any,
        type: input.type,
        source: "BANK",
      },
    });
  }

  async match(params: { movementId: string; statementLineId: string }) {
    const movement = await prisma.bankMovement.findUnique({
      where: { id: params.movementId },
      include: { match: true },
    });
    if (!movement) {
      const err = new Error("Movement not found");
      (err as any).status = 404;
      throw err;
    }
    if (movement.match) {
      const err = new Error("Movement already matched");
      (err as any).status = 409;
      throw err;
    }

    const statement = await prisma.bankStatementLine.findUnique({
      where: { id: params.statementLineId },
      include: { match: true },
    });
    if (!statement) {
      const err = new Error("Statement line not found");
      (err as any).status = 404;
      throw err;
    }
    if (statement.match) {
      const err = new Error("Statement line already matched");
      (err as any).status = 409;
      throw err;
    }

    // MVP: no obligamos a que monto/fecha coincidan, solo se marca manualmente.
    return prisma.bankReconciliationMatch.create({
      data: {
        movementId: params.movementId,
        statementLineId: params.statementLineId,
      },
      include: { movement: true, statementLine: true },
    });
  }

  async unmatchByMovement(movementId: string) {
    const match = await prisma.bankReconciliationMatch.findUnique({
      where: { movementId },
      select: { id: true },
    });
    if (!match) {
      const err = new Error("Match not found for movement");
      (err as any).status = 404;
      throw err;
    }
    await prisma.bankReconciliationMatch.delete({ where: { id: match.id } });
    return { ok: true };
  }
}

