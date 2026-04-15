import { z } from "zod";

const entryType = z.enum(["CREDIT", "DEBIT"]);

export const movementCreateSchema = z.object({
  date: z.string().datetime(),
  description: z.string().min(2).max(240),
  reference: z.string().max(80).optional(),
  amount: z.number().finite(),
  type: entryType,
});

export const statementLineCreateSchema = z.object({
  date: z.string().datetime(),
  description: z.string().min(2).max(240),
  reference: z.string().max(80).optional(),
  amount: z.number().finite(),
  type: entryType,
});

export const matchCreateSchema = z.object({
  movementId: z.string().uuid(),
  statementLineId: z.string().uuid(),
});

export const movementCategoryUpdateSchema = z.object({
  // null para limpiar categoría
  category: z.string().min(2).max(40).nullable(),
});

