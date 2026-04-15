/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { Router } from "express";
import { authJwt } from "../middlewares/authJwt";
import { validateBody } from "../middlewares/validateBody";
import {
  matchCreateSchema,
  movementCreateSchema,
  movementCategoryUpdateSchema,
  statementLineCreateSchema,
  statementImportSchema,
  matchSuggestSchema,
} from "../../domain/banking/banking.schemas";
import { BankingService } from "../../domain/banking/banking.service";
import { parseStatementCsv } from "../../domain/banking/banking.import";

export const bankingRouter = Router();
const bankingService = new BankingService();

bankingRouter.use(authJwt);

bankingRouter.get("/banking/movements", async (_req, res, next) => {
  try {
    const data = await bankingService.listMovements();
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

bankingRouter.post(
  "/banking/movements",
  validateBody(movementCreateSchema),
  async (req, res, next) => {
    try {
      const data = await bankingService.createMovement(req.body);
      res.status(201).json({ data });
    } catch (e) {
      next(e);
    }
  },
);

bankingRouter.patch(
  "/banking/movements/:id/category",
  validateBody(movementCategoryUpdateSchema),
  async (req, res, next) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await bankingService.setMovementCategory({
        movementId: id,
        category: req.body.category,
      });
      res.json({ data });
    } catch (e) {
      next(e);
    }
  },
);

bankingRouter.get("/banking/statements", async (_req, res, next) => {
  try {
    const data = await bankingService.listStatements();
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

bankingRouter.post(
  "/banking/statements",
  validateBody(statementLineCreateSchema),
  async (req, res, next) => {
    try {
      const data = await bankingService.createStatementLine(req.body);
      res.status(201).json({ data });
    } catch (e) {
      next(e);
    }
  },
);

bankingRouter.post(
  "/banking/statements/import",
  validateBody(statementImportSchema),
  async (req, res, next) => {
    try {
      const rows = parseStatementCsv({ csv: req.body.csv });
      const data = await bankingService.importStatementLines(rows);
      res.status(201).json({ data });
    } catch (e) {
      next(e);
    }
  },
);

bankingRouter.post(
  "/banking/match/suggest",
  validateBody(matchSuggestSchema),
  async (req, res, next) => {
    try {
      const data = await bankingService.suggestMatches(req.body);
      res.json({ data });
    } catch (e) {
      next(e);
    }
  },
);

bankingRouter.post(
  "/banking/match",
  validateBody(matchCreateSchema),
  async (req, res, next) => {
    try {
      const data = await bankingService.match(req.body);
      res.status(201).json({ data });
    } catch (e) {
      next(e);
    }
  },
);

bankingRouter.delete("/banking/match/movement/:movementId", async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.movementId)
      ? req.params.movementId[0]
      : req.params.movementId;
    const data = await bankingService.unmatchByMovement(id);
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

