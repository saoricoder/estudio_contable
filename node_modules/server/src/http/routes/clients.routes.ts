/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { Router } from "express";
import { authJwt } from "../middlewares/authJwt";
import { validateBody } from "../middlewares/validateBody";
import {
  clientCreateSchema,
  clientUpdateSchema,
} from "../../domain/clients/clients.schemas";
import { ClientsService } from "../../domain/clients/clients.service";

export const clientsRouter = Router();
const clientsService = new ClientsService();

clientsRouter.use(authJwt);

clientsRouter.get("/clients", async (_req, res, next) => {
  try {
    const data = await clientsService.list();
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

clientsRouter.get("/clients/:id", async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await clientsService.getById(id);
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

clientsRouter.post(
  "/clients",
  validateBody(clientCreateSchema),
  async (req, res, next) => {
    try {
      const data = await clientsService.create(req.body);
      res.status(201).json({ data });
    } catch (e) {
      next(e);
    }
  },
);

clientsRouter.patch(
  "/clients/:id",
  validateBody(clientUpdateSchema),
  async (req, res, next) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await clientsService.update(id, req.body);
      res.json({ data });
    } catch (e) {
      next(e);
    }
  },
);

clientsRouter.delete("/clients/:id", async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await clientsService.remove(id);
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

