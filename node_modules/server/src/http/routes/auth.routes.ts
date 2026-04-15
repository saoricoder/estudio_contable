/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { Router } from "express";
import { validateBody } from "../middlewares/validateBody";
import { loginSchema, registerSchema } from "../../domain/auth/auth.schemas";
import { AuthService } from "../../domain/auth/auth.service";

export const authRouter = Router();
const authService = new AuthService();

authRouter.post("/auth/register", validateBody(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

authRouter.post("/auth/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

