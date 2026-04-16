"use strict";
/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.declarationsRouter = void 0;
const express_1 = require("express");
const authJwt_1 = require("../middlewares/authJwt");
const validateBody_1 = require("../middlewares/validateBody");
const declarations_schemas_1 = require("../../domain/declarations/declarations.schemas");
const declarations_service_1 = require("../../domain/declarations/declarations.service");
exports.declarationsRouter = (0, express_1.Router)();
const declarationsService = new declarations_service_1.DeclarationsService();
exports.declarationsRouter.use(authJwt_1.authJwt);
exports.declarationsRouter.get("/declarations", async (req, res, next) => {
    try {
        const clientId = typeof req.query.clientId === "string" ? req.query.clientId : undefined;
        const status = typeof req.query.status === "string" ? req.query.status : undefined;
        const data = await declarationsService.list({ clientId, status });
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.declarationsRouter.get("/declarations/dashboard", async (_req, res, next) => {
    try {
        const data = await declarationsService.dashboard();
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.declarationsRouter.post("/declarations", (0, validateBody_1.validateBody)(declarations_schemas_1.declarationCreateSchema), async (req, res, next) => {
    try {
        const data = await declarationsService.create(req.body);
        res.status(201).json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.declarationsRouter.patch("/declarations/:id", (0, validateBody_1.validateBody)(declarations_schemas_1.declarationUpdateSchema), async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const data = await declarationsService.update(id, req.body);
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.declarationsRouter.delete("/declarations/:id", async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const data = await declarationsService.remove(id);
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
