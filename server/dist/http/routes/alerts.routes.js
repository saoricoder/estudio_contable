"use strict";
/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertsRouter = void 0;
const express_1 = require("express");
const authJwt_1 = require("../middlewares/authJwt");
const alerts_service_1 = require("../../domain/alerts/alerts.service");
exports.alertsRouter = (0, express_1.Router)();
const alertsService = new alerts_service_1.AlertsService();
exports.alertsRouter.use(authJwt_1.authJwt);
exports.alertsRouter.get("/alerts", async (req, res, next) => {
    try {
        const daysAhead = typeof req.query.daysAhead === "string" ? Number(req.query.daysAhead) : undefined;
        const data = await alertsService.list({
            daysAhead: Number.isFinite(daysAhead) ? daysAhead : undefined,
        });
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
