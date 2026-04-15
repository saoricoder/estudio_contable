"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movementCategoryUpdateSchema = exports.matchCreateSchema = exports.matchSuggestSchema = exports.statementImportSchema = exports.statementLineCreateSchema = exports.movementCreateSchema = void 0;
const zod_1 = require("zod");
const entryType = zod_1.z.enum(["CREDIT", "DEBIT"]);
exports.movementCreateSchema = zod_1.z.object({
    date: zod_1.z.string().datetime(),
    description: zod_1.z.string().min(2).max(240),
    reference: zod_1.z.string().max(80).optional(),
    amount: zod_1.z.number().finite(),
    type: entryType,
});
exports.statementLineCreateSchema = zod_1.z.object({
    date: zod_1.z.string().datetime(),
    description: zod_1.z.string().min(2).max(240),
    reference: zod_1.z.string().max(80).optional(),
    amount: zod_1.z.number().finite(),
    type: entryType,
});
exports.statementImportSchema = zod_1.z.object({
    csv: zod_1.z.string().min(1),
});
exports.matchSuggestSchema = zod_1.z.object({
    statementLineId: zod_1.z.string().uuid(),
    maxDaysDiff: zod_1.z.number().int().min(0).max(10).default(2),
});
exports.matchCreateSchema = zod_1.z.object({
    movementId: zod_1.z.string().uuid(),
    statementLineId: zod_1.z.string().uuid(),
});
exports.movementCategoryUpdateSchema = zod_1.z.object({
    // null para limpiar categoría
    category: zod_1.z.string().min(2).max(40).nullable(),
});
