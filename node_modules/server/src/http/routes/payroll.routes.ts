/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { Router } from "express";
import { authJwt } from "../middlewares/authJwt";
import { validateBody } from "../middlewares/validateBody";
import { payrollCalculateSchema, payrollSaveSchema } from "../../domain/payroll/payroll.schemas";
import { PayrollService } from "../../domain/payroll/payroll.service";

export const payrollRouter = Router();
const payrollService = new PayrollService();

payrollRouter.use(authJwt);

payrollRouter.post(
  "/payroll/calculate",
  validateBody(payrollCalculateSchema),
  async (req, res, next) => {
    try {
      const data = payrollService.calculate(req.body);
      res.json({ data });
    } catch (e) {
      next(e);
    }
  },
);

payrollRouter.get("/payroll/history", async (req, res, next) => {
  try {
    const userId = req.auth?.sub;
    if (!userId) {
      return res.status(401).json({ error: { message: "Unauthorized" } });
    }
    const data = await payrollService.listHistory(userId);
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

payrollRouter.post(
  "/payroll/history",
  validateBody(payrollSaveSchema),
  async (req, res, next) => {
    try {
      const userId = req.auth?.sub;
      if (!userId) {
        return res.status(401).json({ error: { message: "Unauthorized" } });
      }
      const data = await payrollService.save(userId, req.body);
      res.status(201).json({ data });
    } catch (e) {
      next(e);
    }
  },
);

