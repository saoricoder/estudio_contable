/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { Router } from "express";
import { authJwt } from "../middlewares/authJwt";
import { AnalyticsService } from "../../domain/analytics/analytics.service";

export const analyticsRouter = Router();
const analyticsService = new AnalyticsService();

analyticsRouter.use(authJwt);

analyticsRouter.get("/analytics/dashboard", async (_req, res, next) => {
  try {
    const data = await analyticsService.dashboard();
    res.json({ data });
  } catch (e) {
    next(e);
  }
});
