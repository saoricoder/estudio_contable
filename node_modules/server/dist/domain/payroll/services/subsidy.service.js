"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubsidyService = void 0;
// MVP: Subsidio al empleo requiere tabla oficial por periodo (mensual/quincenal).
// Para no bloquear el desarrollo, implementamos:
// - si se provee isrMonthlyEstimate => subsidio = min(isr, subsidyEstimateByIncome)
// - tabla placeholder (ajustable) basada en rangos típicos (no oficial).
class SubsidyService {
    estimateMonthlySubsidy(params) {
        const x = params.monthlyIncome;
        // Tabla simplificada NO OFICIAL para MVP (valores ejemplo).
        // Reemplazar por tabla SAT vigente cuando cerremos el módulo fiscal.
        if (x <= 7000)
            return 390.0;
        if (x <= 9000)
            return 250.0;
        if (x <= 11000)
            return 150.0;
        if (x <= 13000)
            return 50.0;
        return 0;
    }
    applyAgainstIsr(params) {
        if (params.isrMonthlyEstimate == null) {
            return {
                subsidyApplied: 0,
                note: "ISR no proporcionado; subsidio no aplicado (solo estimación disponible).",
            };
        }
        const estimate = this.estimateMonthlySubsidy({ monthlyIncome: params.monthlyIncome });
        const subsidyApplied = round2(Math.min(params.isrMonthlyEstimate, estimate));
        return {
            subsidyApplied,
            note: estimate === 0 ? "Sin subsidio estimado para este nivel de ingreso." : "Subsidio aplicado contra ISR estimado (tabla MVP).",
        };
    }
}
exports.SubsidyService = SubsidyService;
function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}
