"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubsidyService = void 0;
// Subsidio para el empleo 2026 (Decreto DOF 31/12/2025):
// - Aplica si ingreso mensual gravable <= 11,492.66
// - Monto mensual:
//   - Enero 2026 (transitorio): 536.21
//   - Feb-Dic 2026: 535.65
// - Para periodos menores a mes: (monto_mensual / 30.4) * días del periodo
class SubsidyService {
    incomeLimitMonthly = 11492.66;
    monthlyAmount(payDate) {
        if (!payDate)
            return 535.65;
        const y = payDate.getUTCFullYear();
        const m = payDate.getUTCMonth() + 1;
        if (y === 2026 && m === 1)
            return 536.21;
        return 535.65;
    }
    calculatePeriodSubsidy(params) {
        if (params.monthlyIncome > this.incomeLimitMonthly)
            return 0;
        const monthly = this.monthlyAmount(params.payDate);
        return round2((monthly / 30.4) * params.daysInPeriod);
    }
    applyAgainstIsr(params) {
        if (params.isrMonthlyEstimate == null) {
            return {
                subsidyApplied: 0,
                note: "ISR no proporcionado; subsidio no aplicado contra ISR (solo cálculo de IMSS).",
            };
        }
        const periodSubsidy = this.calculatePeriodSubsidy({
            monthlyIncome: params.monthlyIncome,
            daysInPeriod: params.daysInPeriod,
            payDate: params.payDate,
        });
        // Aplicación: no puede exceder el ISR del mes (estimado). Para quincena, aplicamos el proporcional calculado.
        const subsidyApplied = round2(Math.min(params.isrMonthlyEstimate, periodSubsidy));
        return {
            subsidyApplied,
            note: subsidyApplied === 0 ? "Sin subsidio aplicable (ingreso excede límite o ISR=0)." : "Subsidio aplicado (2026).",
        };
    }
}
exports.SubsidyService = SubsidyService;
function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}
