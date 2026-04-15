/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { prisma } from "../../config/prisma";

export type AlertLevel = "GREEN" | "YELLOW" | "RED";

export class AlertsService {
  async list(params?: { daysAhead?: number }) {
    const daysAhead = params?.daysAhead ?? 30;
    const now = new Date();
    const max = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    // 1) Declaraciones registradas (manual/operativo)
    const declarations = await prisma.declaration.findMany({
      where: {
        dueDate: { lte: max },
        status: { in: ["PENDING", "IN_PROGRESS", "OVERDUE"] },
      },
      orderBy: { dueDate: "asc" },
      include: { client: { select: { id: true, name: true, rfc: true } } },
      take: 50,
    });

    const declarationAlerts = declarations.map((d) => {
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

    // 2) Vencimientos fiscales "calendario" por cliente/régimen (MVP):
    // - Provisionales ISR/IVA: día 17 del mes siguiente al periodo
    // Nota: este calendario varía por obligación/régimen; lo hacemos extensible.
    const clients = await prisma.client.findMany({
      select: { id: true, name: true, regimen: true },
      take: 200,
    });

    const calendarAlerts = clients
      .flatMap((c) => {
        const due = nextMonthlyDueDate(now, 17);
        if (due > max) return [];
        const level = semaforo(due, "PENDING");
        return [
          {
            kind: "CALENDAR_DUE",
            level,
            dueDate: due,
            title: `${c.name} · Vencimiento fiscal mensual (día 17)`,
            status: "PENDING",
            clientId: c.id,
            regimen: c.regimen,
          },
        ];
      })
      .slice(0, 50);

    return [...declarationAlerts, ...calendarAlerts].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
  }
}

function semaforo(dueDate: Date, status: string): AlertLevel {
  const now = new Date();
  if (status === "OVERDUE" || dueDate.getTime() < now.getTime()) return "RED";
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays <= 5) return "YELLOW";
  return "GREEN";
}

function nextMonthlyDueDate(from: Date, dayOfMonth: number) {
  // Due date for current/next month depending on today.
  const y = from.getUTCFullYear();
  const m = from.getUTCMonth();
  const candidate = new Date(Date.UTC(y, m, dayOfMonth, 0, 0, 0));
  if (candidate.getTime() >= from.getTime()) return candidate;
  return new Date(Date.UTC(y, m + 1, dayOfMonth, 0, 0, 0));
}

