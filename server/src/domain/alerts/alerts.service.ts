import { prisma } from "../../config/prisma";

export type AlertLevel = "GREEN" | "YELLOW" | "RED";

export class AlertsService {
  async list(params?: { daysAhead?: number }) {
    const daysAhead = params?.daysAhead ?? 30;
    const now = new Date();
    const max = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const declarations = await prisma.declaration.findMany({
      where: {
        dueDate: { lte: max },
        status: { in: ["PENDING", "IN_PROGRESS", "OVERDUE"] },
      },
      orderBy: { dueDate: "asc" },
      include: { client: { select: { id: true, name: true, rfc: true } } },
      take: 50,
    });

    return declarations.map((d) => {
      const level = semaforo(d.dueDate, d.status);
      return {
        kind: "DECLARATION_DUE",
        level,
        dueDate: d.dueDate,
        title: `${d.client.name} · ${d.type} ${d.period}`,
        status: d.status,
        declarationId: d.id,
        clientId: d.clientId,
      };
    });
  }
}

function semaforo(dueDate: Date, status: string): AlertLevel {
  const now = new Date();
  if (status === "OVERDUE" || dueDate.getTime() < now.getTime()) return "RED";
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays <= 5) return "YELLOW";
  return "GREEN";
}

