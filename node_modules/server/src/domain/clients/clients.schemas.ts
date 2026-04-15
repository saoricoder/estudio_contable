import { z } from "zod";
import { REGIMENES_FISCALES } from "./clients.constants";

// RFC: Persona Moral (12) / Persona Física (13), incl. Ñ/& y homoclave.
const RFC_REGEX =
  /^([A-Z&Ñ]{3}[0-9]{6}[A-Z0-9]{3}|[A-Z&Ñ]{4}[0-9]{6}[A-Z0-9]{3})$/;

export const clientCreateSchema = z.object({
  name: z.string().min(2).max(200),
  rfc: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => RFC_REGEX.test(v), "RFC inválido"),
  regimen: z.enum(REGIMENES_FISCALES),
  email: z.string().email().optional(),
  phone: z.string().min(7).max(30).optional(),
});

export const clientUpdateSchema = clientCreateSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  "Debes enviar al menos un campo para actualizar",
);

