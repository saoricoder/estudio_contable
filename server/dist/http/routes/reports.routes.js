"use strict";
/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRouter = void 0;
const express_1 = require("express");
const authJwt_1 = require("../middlewares/authJwt");
const financialHealth_service_1 = require("../../domain/reports/financialHealth.service");
const financialHealthPdf_1 = require("../../domain/reports/pdf/financialHealthPdf");
exports.reportsRouter = (0, express_1.Router)();
const financialHealthService = new financialHealth_service_1.FinancialHealthService();
exports.reportsRouter.use(authJwt_1.authJwt);
exports.reportsRouter.get("/reports/financial-health.pdf", async (req, res, next) => {
    try {
        const month = typeof req.query.month === "string" ? req.query.month : undefined;
        if (!month) {
            return res.status(400).json({ error: { message: "Missing query param: month (YYYY-MM)" } });
        }
        const summary = await financialHealthService.details({ month });
        const doc = (0, financialHealthPdf_1.buildFinancialHealthPdf)({
            clientName: "Contadores Unidos MX",
            summary,
        });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="salud-financiera-${month}.pdf"`);
        doc.pipe(res);
        doc.end();
    }
    catch (e) {
        next(e);
    }
});
