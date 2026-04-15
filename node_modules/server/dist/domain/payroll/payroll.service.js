"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollService = void 0;
const imss_service_1 = require("./services/imss.service");
const subsidy_service_1 = require("./services/subsidy.service");
class PayrollService {
    imss = new imss_service_1.ImssService();
    subsidy = new subsidy_service_1.SubsidyService();
    calculate(input) {
        const monthlyGross = input.salaryType === "MONTHLY"
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
        const net = subsidy.subsidyApplied > 0
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
exports.PayrollService = PayrollService;
function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}
