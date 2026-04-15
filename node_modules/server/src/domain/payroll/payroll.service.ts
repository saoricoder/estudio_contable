import { ImssService } from "./services/imss.service";
import { SubsidyService } from "./services/subsidy.service";
import type { PayrollCalculateInput } from "./payroll.schemas";

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

    const subsidy = this.subsidy.applyAgainstIsr({
      isrMonthlyEstimate: input.isrMonthlyEstimate,
      monthlyIncome: monthlyGross,
    });

    // Neto MVP: bruto del periodo - IMSS trabajador + subsidio aplicado (si hubo ISR estimado)
    const net =
      subsidy.subsidyApplied > 0
        ? round2(periodGross - imss.employeeContrib.total + subsidy.subsidyApplied / 2)
        : round2(periodGross - imss.employeeContrib.total);

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
        "IMSS: cálculo MVP aproximado (no incluye todas las partidas/topes).",
        "Subsidio: tabla MVP no oficial; se reemplazará por tabla SAT vigente.",
      ],
    };
  }
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

