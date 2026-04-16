"use strict";
/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.payrollRouter = void 0;
const express_1 = require("express");
const authJwt_1 = require("../middlewares/authJwt");
const validateBody_1 = require("../middlewares/validateBody");
const payroll_schemas_1 = require("../../domain/payroll/payroll.schemas");
const payroll_service_1 = require("../../domain/payroll/payroll.service");
exports.payrollRouter = (0, express_1.Router)();
const payrollService = new payroll_service_1.PayrollService();
exports.payrollRouter.use(authJwt_1.authJwt);
exports.payrollRouter.post("/payroll/calculate", (0, validateBody_1.validateBody)(payroll_schemas_1.payrollCalculateSchema), async (req, res, next) => {
    try {
        const data = payrollService.calculate(req.body);
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.payrollRouter.get("/payroll/history", async (req, res, next) => {
    try {
        const userId = req.auth?.sub;
        if (!userId) {
            return res.status(401).json({ error: { message: "Unauthorized" } });
        }
        const data = await payrollService.listHistory(userId);
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.payrollRouter.post("/payroll/history", (0, validateBody_1.validateBody)(payroll_schemas_1.payrollSaveSchema), async (req, res, next) => {
    try {
        const userId = req.auth?.sub;
        if (!userId) {
            return res.status(401).json({ error: { message: "Unauthorized" } });
        }
        const data = await payrollService.save(userId, req.body);
        res.status(201).json({ data });
    }
    catch (e) {
        next(e);
    }
});
