/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import bcrypt from "bcrypt";

import { prisma } from "../src/config/prisma";

async function assertSchemaPresent() {
  try {
    await prisma.declaration.count();
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code?: string }).code) : "";
    if (code === "P2021") {
      throw new Error(
        'Faltan tablas en la base de datos. Desde la carpeta `server` ejecuta `npx prisma migrate deploy` y luego vuelve a correr `npm run seed`.',
      );
    }
    throw e;
  }
}

function d(iso: string) {
  // Ensure we stay in 2026 (UTC)
  return new Date(iso);
}

function ym(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function money(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

async function main() {
  await assertSchemaPresent();

  // Make seeding repeatable.
  await prisma.bankReconciliationMatch.deleteMany();
  await prisma.bankStatementLine.deleteMany();
  await prisma.bankMovement.deleteMany();
  await prisma.recurringInvoice.deleteMany();
  await prisma.declaration.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Admin user (for JWT auth testing)
  const admin = await prisma.user.create({
    data: {
      email: "admin@contadoresmx.com",
      passwordHash: await bcrypt.hash("Password123!", 12),
      createdAt: d("2026-04-01T00:00:00.000Z"),
      updatedAt: d("2026-04-01T00:00:00.000Z"),
    },
    select: { id: true, email: true },
  });

  // 1) Clientes de Prueba (México)
  // RFC format validated by backend: [A-Z&Ñ]{3,4} + YYMMDD + [A-Z0-9]{3}
  const clientInputs = [
    {
      name: "Comercializadora Rivera y Asociados, S.A. de C.V.",
      rfc: "CRA260101A1B",
      regimen: "601",
      email: "contacto@rivera-asociados.mx",
      phone: "55 1234 5678",
      createdAt: d("2026-01-05T00:00:00.000Z"),
      updatedAt: d("2026-01-05T00:00:00.000Z"),
    },
    {
      name: "María Fernanda López García",
      rfc: "LOGM9002159K3",
      regimen: "605",
      email: "maria.lopez@example.com",
      phone: "33 2222 3333",
      createdAt: d("2026-01-07T00:00:00.000Z"),
      updatedAt: d("2026-01-07T00:00:00.000Z"),
    },
    {
      name: "Servicios Integrales del Bajío, S. de R.L.",
      rfc: "SIB260305Q7X",
      regimen: "612",
      email: "admin@serviciosbajio.mx",
      phone: "44 5555 0101",
      createdAt: d("2026-01-09T00:00:00.000Z"),
      updatedAt: d("2026-01-09T00:00:00.000Z"),
    },
    {
      name: "Ana Sofía Hernández Ruiz",
      rfc: "HERA880720K21",
      regimen: "626", // RESICO
      email: "ana.hernandez@example.com",
      phone: "81 4444 7777",
      createdAt: d("2026-02-01T00:00:00.000Z"),
      updatedAt: d("2026-02-01T00:00:00.000Z"),
    },
    {
      name: "Arrendadora del Centro, S.A.",
      rfc: "ADC260210M5N",
      regimen: "606",
      email: "facturacion@arrendadoracentro.mx",
      phone: "55 9876 0001",
      createdAt: d("2026-02-10T00:00:00.000Z"),
      updatedAt: d("2026-02-10T00:00:00.000Z"),
    },
  ] as const;

  const clients = [];
  for (const input of clientInputs) {
    clients.push(await prisma.client.create({ data: input }));
  }

  // 2) "Nóminas 2026" (no hay modelo de nómina; usamos Declaration PAYROLL con notas quincenales)
  // Creamos 12 declaraciones PAYROLL por cliente, una por mes (period YYYY-MM), con notas que incluyen quincenas + cálculo simulado.
  const payrollMonths = Array.from({ length: 12 }, (_, i) => new Date(Date.UTC(2026, i, 1, 0, 0, 0)));
  for (const c of clients) {
    for (const m of payrollMonths) {
      const period = ym(m);
      const due = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), 17, 0, 0, 0));
      const grossMonthly = 16000 + (c.name.length % 7) * 1250; // deterministic-ish variety
      const imss = money(grossMonthly * 0.02); // simulated
      const subsidy = money(grossMonthly <= 11492.66 ? 535.65 : 0); // simulated rule aligned to service
      const net = money(grossMonthly - imss + Math.min(subsidy, 1200));

      await prisma.declaration.create({
        data: {
          clientId: c.id,
          type: "PAYROLL",
          status: m.getUTCMonth() < 2 ? "PAID" : "PENDING",
          period,
          dueDate: due,
          filedAt: m.getUTCMonth() < 2 ? new Date(Date.UTC(2026, m.getUTCMonth(), 10, 0, 0, 0)) : undefined,
          notes:
            `Nómina quincenal (simulada) ${period}. ` +
            `Q1/Q2: bruto mensual ${grossMonthly} MXN; IMSS aprox ${imss} MXN; subsidio aprox ${subsidy} MXN; neto est. ${net} MXN.`,
          createdAt: new Date(Date.UTC(2026, m.getUTCMonth(), 2, 0, 0, 0)),
          updatedAt: new Date(Date.UTC(2026, m.getUTCMonth(), 2, 0, 0, 0)),
        },
      });
    }
  }

  // 3) Facturación recurrente (10)
  // Estatus real: paymentStatus + pendingBalance (saldo a cobrar).
  const invoiceTemplates = [
    { concept: "Honorarios contables mensuales", amount: 2500, freq: "MONTHLY" as const },
    { concept: "Declaraciones provisionales (servicio)", amount: 3200, freq: "MONTHLY" as const },
    { concept: "Cálculo de nómina y cumplimiento", amount: 1800, freq: "MONTHLY" as const },
    { concept: "Contabilidad general y conciliación", amount: 4200, freq: "MONTHLY" as const },
    { concept: "Asesoría fiscal trimestral", amount: 9000, freq: "QUARTERLY" as const },
  ];

  const invoices = [];
  for (let i = 0; i < 10; i++) {
    const c = clients[i % clients.length]!;
    const tpl = invoiceTemplates[i % invoiceTemplates.length]!;
    const bucket = i < 4 ? "DEMO_PAGO" : i < 7 ? "PENDIENTE" : "VENCIDA";

    const startDate = d("2026-01-01T00:00:00.000Z");
    const nextRunDate =
      bucket === "DEMO_PAGO"
        ? d("2026-06-01T00:00:00.000Z")
        : bucket === "PENDIENTE"
          ? d("2026-04-17T00:00:00.000Z")
          : d("2026-02-01T00:00:00.000Z");

    const paymentStatus =
      bucket === "DEMO_PAGO"
        ? ("PENDING" as const)
        : bucket === "PENDIENTE"
          ? ("PENDING" as const)
          : ("OVERDUE" as const);
    const pendingBalance = tpl.amount as any;

    const inv = await prisma.recurringInvoice.create({
      data: {
        clientId: c.id,
        concept: `[${bucket}] ${tpl.concept}`,
        amount: tpl.amount as any,
        pendingBalance,
        paymentStatus,
        currency: "MXN",
        frequency: tpl.freq,
        startDate,
        nextRunDate,
        active: true,
        createdAt: d("2026-03-01T00:00:00.000Z"),
        updatedAt: d("2026-03-01T00:00:00.000Z"),
      },
    });
    invoices.push(inv);
  }

  // 4) Conciliación bancaria: primeras 4 facturas demo tienen saldo pendiente = monto (conciliación → PAID).
  const paidInvoices = invoices.filter((x) => x.concept.startsWith("[DEMO_PAGO]"));
  for (let i = 0; i < paidInvoices.length; i++) {
    const inv = paidInvoices[i]!;
    const baseDate = new Date(Date.UTC(2026, 3, 8 + i, 0, 0, 0)); // abril 2026
    const amount = Number(inv.amount.toString());

    const movement = await prisma.bankMovement.create({
      data: {
        date: baseDate,
        description: `Pago recibido: ${inv.concept.replace(/^\[DEMO_PAGO\]\s*/, "")}`,
        reference: `INV-${String(i + 1).padStart(3, "0")}`,
        amount: amount as any,
        type: "CREDIT",
        source: "BOOK",
        category: "Servicios",
        createdAt: baseDate,
        updatedAt: baseDate,
      },
    });

    const statement = await prisma.bankStatementLine.create({
      data: {
        date: baseDate,
        description: `DEPÓSITO CLIENTE · ${inv.id.slice(0, 6)}`,
        reference: `BAN-${String(i + 1).padStart(3, "0")}`,
        amount: amount as any,
        type: "CREDIT",
        source: "BANK",
        createdAt: baseDate,
        updatedAt: baseDate,
      },
    });

    const match = await prisma.bankReconciliationMatch.create({
      data: {
        movementId: movement.id,
        statementLineId: statement.id,
        createdAt: baseDate,
      },
    });
    await prisma.recurringInvoice.update({
      where: { id: inv.id },
      data: { paymentStatus: "PAID", pendingBalance: 0 },
    });
    await prisma.bankReconciliationMatch.update({
      where: { id: match.id },
      data: { markedRecurringInvoiceId: inv.id },
    });
  }

  // 4b) Ingresos conciliados en varios meses de 2026 (Analytics: barras con datos)
  for (let monthIdx = 0; monthIdx < 6; monthIdx++) {
    const baseDate = new Date(Date.UTC(2026, monthIdx, 10, 12, 0, 0));
    const amount = 8200 + monthIdx * 500;
    const movement = await prisma.bankMovement.create({
      data: {
        date: baseDate,
        description: `Cobro honorarios (seed · mes ${String(monthIdx + 1).padStart(2, "0")}/2026)`,
        reference: `MULTI-${monthIdx + 1}`,
        amount: amount as any,
        type: "CREDIT",
        source: "BOOK",
        category: "Servicios",
        createdAt: baseDate,
        updatedAt: baseDate,
      },
    });
    const statement = await prisma.bankStatementLine.create({
      data: {
        date: baseDate,
        description: `DEP MULTI-MES ${monthIdx + 1}`,
        reference: `BAN-M${monthIdx + 1}`,
        amount: amount as any,
        type: "CREDIT",
        source: "BANK",
        createdAt: baseDate,
        updatedAt: baseDate,
      },
    });
    await prisma.bankReconciliationMatch.create({
      data: {
        movementId: movement.id,
        statementLineId: statement.id,
        createdAt: baseDate,
      },
    });
  }

  // Agregamos algunos egresos conciliados para que el reporte PDF tenga gastos.
  for (let i = 0; i < 3; i++) {
    const baseDate = new Date(Date.UTC(2026, 3, 12 + i, 0, 0, 0));
    const amount = -(1200 + i * 350);
    const movement = await prisma.bankMovement.create({
      data: {
        date: baseDate,
        description: `Pago proveedor ${i + 1}`,
        reference: `PROV-${i + 1}`,
        amount: amount as any,
        type: "DEBIT",
        source: "BOOK",
        category: i === 0 ? "Impuestos" : i === 1 ? "Proveedores" : "Comisiones bancarias",
        createdAt: baseDate,
        updatedAt: baseDate,
      },
    });
    const statement = await prisma.bankStatementLine.create({
      data: {
        date: baseDate,
        description: `SPEI PROVEEDOR ${i + 1}`,
        reference: `SPEI-${i + 1}`,
        amount: amount as any,
        type: "DEBIT",
        source: "BANK",
        createdAt: baseDate,
        updatedAt: baseDate,
      },
    });
    await prisma.bankReconciliationMatch.create({
      data: {
        movementId: movement.id,
        statementLineId: statement.id,
        createdAt: baseDate,
      },
    });
  }

  // 5) Alertas: 2 vencimientos fiscales para la próxima semana (abril 2026)
  // Las alertas se calculan desde declaraciones (status + dueDate). Creamos 2 declaraciones PROVISIONAL.
  // "Próxima semana" a abril 2026 -> usamos 2026-04-17 y 2026-04-18.
  const alertDue1 = d("2026-04-17T00:00:00.000Z");
  const alertDue2 = d("2026-04-18T00:00:00.000Z");
  await prisma.declaration.create({
    data: {
      clientId: clients[0]!.id,
      type: "PROVISIONAL",
      status: "PENDING",
      period: "2026-03",
      dueDate: alertDue1,
      notes: "Vencimiento fiscal próximo (seed).",
      createdAt: d("2026-04-10T00:00:00.000Z"),
      updatedAt: d("2026-04-10T00:00:00.000Z"),
    },
  });
  await prisma.declaration.create({
    data: {
      clientId: clients[1]!.id,
      type: "VAT",
      status: "IN_PROGRESS",
      period: "2026-03",
      dueDate: alertDue2,
      notes: "IVA mensual en preparación (seed).",
      createdAt: d("2026-04-10T00:00:00.000Z"),
      updatedAt: d("2026-04-10T00:00:00.000Z"),
    },
  });

  console.log("Seed completado.");
  console.log(`Usuario admin: ${admin.email} (Password123!)`);
  console.log(`Clientes creados: ${clients.length}`);
  console.log(`Facturas recurrentes creadas: ${invoices.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

