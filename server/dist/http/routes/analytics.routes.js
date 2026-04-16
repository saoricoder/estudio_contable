"use strict";
/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
const express_1 = require("express");
const authJwt_1 = require("../middlewares/authJwt");
const analytics_service_1 = require("../../domain/analytics/analytics.service");
exports.analyticsRouter = (0, express_1.Router)();
const analyticsService = new analytics_service_1.AnalyticsService();
exports.analyticsRouter.use(authJwt_1.authJwt);
exports.analyticsRouter.get("/analytics/dashboard", async (_req, res, next) => {
    try {
        const data = await analyticsService.dashboard();
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
