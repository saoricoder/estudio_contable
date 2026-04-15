"use strict";
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
