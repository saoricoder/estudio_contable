import { z } from "zod";

export const payrollCalculateSchema = z.object({
  // Salario base nominal mensual o diario según `salaryType`
  salaryType: z.enum(["MONTHLY", "DAILY"]).default("MONTHLY"),
  grossSalary: z.number().positive(),
  daysInPeriod: z.number().int().min(1).max(16).default(15),
  // Para aproximación del IMSS
  integrationFactor: z.number().min(1).max(2).default(1.0452),
  // Parámetros ajustables (UMA y tabla subsidio pueden cambiar por año)
  umaDaily: z.number().positive().default(113.14),
  // Fecha de pago para aplicar reglas vigentes (ej. subsidio enero 2026)
  payDate: z.string().datetime().optional(),
  // Cuando aplique: ISR mensual aproximado (para subsidio). Lo dejamos como opcional.
  isrMonthlyEstimate: z.number().min(0).optional(),
});

export type PayrollCalculateInput = z.infer<typeof payrollCalculateSchema>;

