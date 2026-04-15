"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recurringInvoiceUpdateSchema = exports.recurringInvoiceCreateSchema = void 0;
const zod_1 = require("zod");
exports.recurringInvoiceCreateSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid(),
    concept: zod_1.z.string().min(2).max(240),
    amount: zod_1.z.number().positive().max(10_000_000),
    currency: zod_1.z.string().min(3).max(3).default("MXN"),
    frequency: zod_1.z.enum(["MONTHLY", "BIMONTHLY", "QUARTERLY", "YEARLY"]).default("MONTHLY"),
    startDate: zod_1.z.string().datetime(),
    nextRunDate: zod_1.z.string().datetime(),
    active: zod_1.z.boolean().default(true),
});
exports.recurringInvoiceUpdateSchema = exports.recurringInvoiceCreateSchema
    .omit({ clientId: true })
    .partial()
    .refine((v) => Object.keys(v).length > 0, "Debes enviar al menos un campo para actualizar");
