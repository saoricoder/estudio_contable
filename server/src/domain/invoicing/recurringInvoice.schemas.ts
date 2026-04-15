import { z } from "zod";

export const recurringInvoiceCreateSchema = z.object({
  clientId: z.string().uuid(),
  concept: z.string().min(2).max(240),
  amount: z.number().positive().max(10_000_000),
  currency: z.string().min(3).max(3).default("MXN"),
  frequency: z.enum(["MONTHLY", "BIMONTHLY", "QUARTERLY", "YEARLY"]).default("MONTHLY"),
  startDate: z.string().datetime(),
  nextRunDate: z.string().datetime(),
  active: z.boolean().default(true),
});

export const recurringInvoiceUpdateSchema = recurringInvoiceCreateSchema
  .omit({ clientId: true })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Debes enviar al menos un campo para actualizar");

