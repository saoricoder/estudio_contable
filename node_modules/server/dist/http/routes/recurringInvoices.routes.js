"use strict";
/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.recurringInvoicesRouter = void 0;
const express_1 = require("express");
const authJwt_1 = require("../middlewares/authJwt");
const validateBody_1 = require("../middlewares/validateBody");
const recurringInvoice_schemas_1 = require("../../domain/invoicing/recurringInvoice.schemas");
const recurringInvoice_service_1 = require("../../domain/invoicing/recurringInvoice.service");
exports.recurringInvoicesRouter = (0, express_1.Router)();
const recurringInvoiceService = new recurringInvoice_service_1.RecurringInvoiceService();
exports.recurringInvoicesRouter.use(authJwt_1.authJwt);
exports.recurringInvoicesRouter.get("/invoices/recurring", async (_req, res, next) => {
    try {
        const data = await recurringInvoiceService.list();
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.recurringInvoicesRouter.post("/invoices/recurring", (0, validateBody_1.validateBody)(recurringInvoice_schemas_1.recurringInvoiceCreateSchema), async (req, res, next) => {
    try {
        const data = await recurringInvoiceService.create(req.body);
        res.status(201).json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.recurringInvoicesRouter.patch("/invoices/recurring/:id", (0, validateBody_1.validateBody)(recurringInvoice_schemas_1.recurringInvoiceUpdateSchema), async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const data = await recurringInvoiceService.update(id, req.body);
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.recurringInvoicesRouter.delete("/invoices/recurring/:id", async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const data = await recurringInvoiceService.remove(id);
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
