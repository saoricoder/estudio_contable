import { prisma } from "../../config/prisma";
import type { ImportedStatementRow } from "./banking.import";

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

  async importStatementLines(rows: ImportedStatementRow[]) {
    // MVP: importación simple sin deduplicación sofisticada.
    const created = await prisma.bankStatementLine.createMany({
      data: rows.map((r) => ({
        date: new Date(r.date),
        description: r.description,
        reference: r.reference,
        amount: r.amount as any,
        type: r.type,
        source: "BANK",
      })),
      skipDuplicates: false,
    });
    return { inserted: created.count };
  }

  async suggestMatches(params: { statementLineId: string; maxDaysDiff: number }) {
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

    const targetAmount = Number(statement.amount.toString());
    const start = new Date(statement.date);
    const end = new Date(statement.date);
    start.setUTCDate(start.getUTCDate() - params.maxDaysDiff);
    end.setUTCDate(end.getUTCDate() + params.maxDaysDiff);

    const candidates = await prisma.bankMovement.findMany({
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
        const dayDiff = Math.abs(
          Math.floor((new Date(m.date).getTime() - new Date(statement.date).getTime()) / (24 * 60 * 60 * 1000)),
        );
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

  async setMovementCategory(params: { movementId: string; category: string | null }) {
    const existing = await prisma.bankMovement.findUnique({
      where: { id: params.movementId },
      select: { id: true },
    });
    if (!existing) {
      const err = new Error("Movement not found");
      (err as any).status = 404;
      throw err;
    }
    return prisma.bankMovement.update({
      where: { id: params.movementId },
      data: { category: params.category },
    });
  }
}

