"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientsRouter = void 0;
const express_1 = require("express");
const authJwt_1 = require("../middlewares/authJwt");
const validateBody_1 = require("../middlewares/validateBody");
const clients_schemas_1 = require("../../domain/clients/clients.schemas");
const clients_service_1 = require("../../domain/clients/clients.service");
exports.clientsRouter = (0, express_1.Router)();
const clientsService = new clients_service_1.ClientsService();
exports.clientsRouter.use(authJwt_1.authJwt);
exports.clientsRouter.get("/clients", async (_req, res, next) => {
    try {
        const data = await clientsService.list();
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.clientsRouter.get("/clients/:id", async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const data = await clientsService.getById(id);
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.clientsRouter.post("/clients", (0, validateBody_1.validateBody)(clients_schemas_1.clientCreateSchema), async (req, res, next) => {
    try {
        const data = await clientsService.create(req.body);
        res.status(201).json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.clientsRouter.patch("/clients/:id", (0, validateBody_1.validateBody)(clients_schemas_1.clientUpdateSchema), async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const data = await clientsService.update(id, req.body);
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.clientsRouter.delete("/clients/:id", async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const data = await clientsService.remove(id);
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
