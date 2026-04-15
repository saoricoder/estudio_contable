/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { Router } from "express";
import { authJwt } from "../middlewares/authJwt";
import { AlertsService } from "../../domain/alerts/alerts.service";

export const alertsRouter = Router();
const alertsService = new AlertsService();

alertsRouter.use(authJwt);

alertsRouter.get("/alerts", async (req, res, next) => {
  try {
    const daysAhead =
      typeof req.query.daysAhead === "string" ? Number(req.query.daysAhead) : undefined;
    const data = await alertsService.list({
      daysAhead: Number.isFinite(daysAhead) ? daysAhead : undefined,
    });
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

