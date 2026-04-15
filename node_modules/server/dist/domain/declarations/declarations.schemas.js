"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.declarationUpdateSchema = exports.declarationCreateSchema = void 0;
const zod_1 = require("zod");
exports.declarationCreateSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(["PROVISIONAL", "ANNUAL", "PAYROLL", "VAT"]).default("PROVISIONAL"),
    status: zod_1.z.enum(["PENDING", "IN_PROGRESS", "SUBMITTED", "PAID", "OVERDUE"]).default("PENDING"),
    period: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Periodo inválido (YYYY-MM)"),
    dueDate: zod_1.z.string().datetime(),
    filedAt: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().max(500).optional(),
});
exports.declarationUpdateSchema = exports.declarationCreateSchema
    .omit({ clientId: true })
    .partial()
    .refine((v) => Object.keys(v).length > 0, "Debes enviar al menos un campo para actualizar");
