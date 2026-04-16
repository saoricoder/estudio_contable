/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { prisma } from "../../config/prisma";
import { ImssService } from "./services/imss.service";
import { SubsidyService } from "./services/subsidy.service";
import type { PayrollCalculateInput, PayrollSaveInput } from "./payroll.schemas";

export class PayrollService {
  private imss = new ImssService();
  private subsidy = new SubsidyService();

  calculate(input: PayrollCalculateInput) {
    const monthlyGross =
      input.salaryType === "MONTHLY"
        ? input.grossSalary
        : input.grossSalary * 30.4;

    const dailyGross = monthlyGross / 30.4;
    const periodGross = round2(dailyGross * input.daysInPeriod);

    const sbcDaily = dailyGross * input.integrationFactor;
    const imss = this.imss.calculateEmployeeContrib({
      sbcDaily,
      daysInPeriod: input.daysInPeriod,
      umaDaily: input.umaDaily,
    });

    const payDate = input.payDate ? new Date(input.payDate) : undefined;
    const subsidy = this.subsidy.applyAgainstIsr({
      isrMonthlyEstimate: input.isrMonthlyEstimate,
      monthlyIncome: monthlyGross,
      daysInPeriod: input.daysInPeriod,
      payDate,
    });

    // Neto (MVP formal): bruto del periodo - IMSS trabajador + subsidio aplicado (si procede)
    const net = round2(periodGross - imss.employeeContrib.total + subsidy.subsidyApplied);

    return {
      input,
      gross: {
        monthly: round2(monthlyGross),
        daily: round2(dailyGross),
        period: periodGross,
      },
      imss,
      subsidy,
      netEstimate: net,
      disclaimers: [
        "IMSS (cuota obrera): incluye EM dinero, EM GMP, EM excedente 3 UMA, IV y CV; tope SBC 25 UMA. No incluye INFONAVIT ni aportación patronal completa.",
        "Subsidio 2026: aplica tope y monto mensual decretado; para periodos menores a mes se prorratea con 30.4 días.",
      ],
    };
  }

  async save(userId: string, input: PayrollSaveInput) {
    const { employeeName, fiscalYear, ...calcInput } = input;
    const result = this.calculate(calcInput);
    const imssTotal = result.imss.employeeContrib.total;

    return prisma.payrollHistory.create({
      data: {
        userId,
        employeeName,
        fiscalYear,
        grossMonthly: result.gross.monthly as any,
        grossPeriod: result.gross.period as any,
        imssTotal: imssTotal as any,
        subsidyApplied: result.subsidy.subsidyApplied as any,
        netEstimate: result.netEstimate as any,
        payDate: input.payDate ? new Date(input.payDate) : null,
      },
    });
  }

  async listHistory(userId: string) {
    return prisma.payrollHistory.findMany({
      where: { userId },
      orderBy: { calculatedAt: "desc" },
      take: 200,
    });
  }
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

