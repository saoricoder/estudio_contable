/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { Router } from "express";
import { authJwt } from "../middlewares/authJwt";
import { validateBody } from "../middlewares/validateBody";
import { payrollCalculateSchema } from "../../domain/payroll/payroll.schemas";
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

