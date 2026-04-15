"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const validateBody_1 = require("../middlewares/validateBody");
const auth_schemas_1 = require("../../domain/auth/auth.schemas");
const auth_service_1 = require("../../domain/auth/auth.service");
exports.authRouter = (0, express_1.Router)();
const authService = new auth_service_1.AuthService();
exports.authRouter.post("/auth/register", (0, validateBody_1.validateBody)(auth_schemas_1.registerSchema), async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    }
    catch (e) {
        next(e);
    }
});
exports.authRouter.post("/auth/login", (0, validateBody_1.validateBody)(auth_schemas_1.loginSchema), async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
});
