import { Router } from "express";
import { authJwt } from "../middlewares/authJwt";
import { validateBody } from "../middlewares/validateBody";
import {
  declarationCreateSchema,
  declarationUpdateSchema,
} from "../../domain/declarations/declarations.schemas";
import { DeclarationsService } from "../../domain/declarations/declarations.service";

export const declarationsRouter = Router();
const declarationsService = new DeclarationsService();

declarationsRouter.use(authJwt);

declarationsRouter.get("/declarations", async (req, res, next) => {
  try {
    const clientId = typeof req.query.clientId === "string" ? req.query.clientId : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const data = await declarationsService.list({ clientId, status });
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

declarationsRouter.get("/declarations/dashboard", async (_req, res, next) => {
  try {
    const data = await declarationsService.dashboard();
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

declarationsRouter.post(
  "/declarations",
  validateBody(declarationCreateSchema),
  async (req, res, next) => {
    try {
      const data = await declarationsService.create(req.body);
      res.status(201).json({ data });
    } catch (e) {
      next(e);
    }
  },
);

declarationsRouter.patch(
  "/declarations/:id",
  validateBody(declarationUpdateSchema),
  async (req, res, next) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await declarationsService.update(id, req.body);
      res.json({ data });
    } catch (e) {
      next(e);
    }
  },
);

declarationsRouter.delete("/declarations/:id", async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await declarationsService.remove(id);
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

