"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bankingRouter = void 0;
const express_1 = require("express");
const authJwt_1 = require("../middlewares/authJwt");
const validateBody_1 = require("../middlewares/validateBody");
const banking_schemas_1 = require("../../domain/banking/banking.schemas");
const banking_service_1 = require("../../domain/banking/banking.service");
const banking_import_1 = require("../../domain/banking/banking.import");
exports.bankingRouter = (0, express_1.Router)();
const bankingService = new banking_service_1.BankingService();
exports.bankingRouter.use(authJwt_1.authJwt);
exports.bankingRouter.get("/banking/movements", async (_req, res, next) => {
    try {
        const data = await bankingService.listMovements();
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.bankingRouter.post("/banking/movements", (0, validateBody_1.validateBody)(banking_schemas_1.movementCreateSchema), async (req, res, next) => {
    try {
        const data = await bankingService.createMovement(req.body);
        res.status(201).json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.bankingRouter.patch("/banking/movements/:id/category", (0, validateBody_1.validateBody)(banking_schemas_1.movementCategoryUpdateSchema), async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const data = await bankingService.setMovementCategory({
            movementId: id,
            category: req.body.category,
        });
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.bankingRouter.get("/banking/statements", async (_req, res, next) => {
    try {
        const data = await bankingService.listStatements();
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.bankingRouter.post("/banking/statements", (0, validateBody_1.validateBody)(banking_schemas_1.statementLineCreateSchema), async (req, res, next) => {
    try {
        const data = await bankingService.createStatementLine(req.body);
        res.status(201).json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.bankingRouter.post("/banking/statements/import", (0, validateBody_1.validateBody)(banking_schemas_1.statementImportSchema), async (req, res, next) => {
    try {
        const rows = (0, banking_import_1.parseStatementCsv)({ csv: req.body.csv });
        const data = await bankingService.importStatementLines(rows);
        res.status(201).json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.bankingRouter.post("/banking/match/suggest", (0, validateBody_1.validateBody)(banking_schemas_1.matchSuggestSchema), async (req, res, next) => {
    try {
        const data = await bankingService.suggestMatches(req.body);
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.bankingRouter.post("/banking/match", (0, validateBody_1.validateBody)(banking_schemas_1.matchCreateSchema), async (req, res, next) => {
    try {
        const data = await bankingService.match(req.body);
        res.status(201).json({ data });
    }
    catch (e) {
        next(e);
    }
});
exports.bankingRouter.delete("/banking/match/movement/:movementId", async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.movementId)
            ? req.params.movementId[0]
            : req.params.movementId;
        const data = await bankingService.unmatchByMovement(id);
        res.json({ data });
    }
    catch (e) {
        next(e);
    }
});
