import { z } from "zod";

export const declarationCreateSchema = z.object({
  clientId: z.string().uuid(),
  type: z.enum(["PROVISIONAL", "ANNUAL", "PAYROLL", "VAT"]).default("PROVISIONAL"),
  status: z.enum(["PENDING", "IN_PROGRESS", "SUBMITTED", "PAID", "OVERDUE"]).default("PENDING"),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Periodo inválido (YYYY-MM)"),
  dueDate: z.string().datetime(),
  filedAt: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

export const declarationUpdateSchema = declarationCreateSchema
  .omit({ clientId: true })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Debes enviar al menos un campo para actualizar");

