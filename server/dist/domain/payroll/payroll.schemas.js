"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payrollCalculateSchema = void 0;
const zod_1 = require("zod");
exports.payrollCalculateSchema = zod_1.z.object({
    // Salario base nominal mensual o diario según `salaryType`
    salaryType: zod_1.z.enum(["MONTHLY", "DAILY"]).default("MONTHLY"),
    grossSalary: zod_1.z.number().positive(),
    daysInPeriod: zod_1.z.number().int().min(1).max(16).default(15),
    // Para aproximación del IMSS
    integrationFactor: zod_1.z.number().min(1).max(2).default(1.0452),
    // Parámetros ajustables (UMA y tabla subsidio pueden cambiar por año)
    umaDaily: zod_1.z.number().positive().default(113.14),
    // Fecha de pago para aplicar reglas vigentes (ej. subsidio enero 2026)
    payDate: zod_1.z.string().datetime().optional(),
    // Cuando aplique: ISR mensual aproximado (para subsidio). Lo dejamos como opcional.
    isrMonthlyEstimate: zod_1.z.number().min(0).optional(),
});
