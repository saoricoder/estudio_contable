"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchCreateSchema = exports.statementLineCreateSchema = exports.movementCreateSchema = void 0;
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
exports.matchCreateSchema = zod_1.z.object({
    movementId: zod_1.z.string().uuid(),
    statementLineId: zod_1.z.string().uuid(),
});
