"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientUpdateSchema = exports.clientCreateSchema = void 0;
const zod_1 = require("zod");
const clients_constants_1 = require("./clients.constants");
// RFC: Persona Moral (12) / Persona Física (13), incl. Ñ/& y homoclave.
const RFC_REGEX = /^([A-Z&Ñ]{3}[0-9]{6}[A-Z0-9]{3}|[A-Z&Ñ]{4}[0-9]{6}[A-Z0-9]{3})$/;
exports.clientCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(200),
    rfc: zod_1.z
        .string()
        .trim()
        .toUpperCase()
        .refine((v) => RFC_REGEX.test(v), "RFC inválido"),
    regimen: zod_1.z.enum(clients_constants_1.REGIMENES_FISCALES),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().min(7).max(30).optional(),
});
exports.clientUpdateSchema = exports.clientCreateSchema.partial().refine((v) => Object.keys(v).length > 0, "Debes enviar al menos un campo para actualizar");
