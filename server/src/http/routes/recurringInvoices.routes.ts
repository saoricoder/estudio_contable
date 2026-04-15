/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { Router } from "express";
import { authJwt } from "../middlewares/authJwt";
import { validateBody } from "../middlewares/validateBody";
import {
  recurringInvoiceCreateSchema,
  recurringInvoiceUpdateSchema,
} from "../../domain/invoicing/recurringInvoice.schemas";
import { RecurringInvoiceService } from "../../domain/invoicing/recurringInvoice.service";

export const recurringInvoicesRouter = Router();
const recurringInvoiceService = new RecurringInvoiceService();

recurringInvoicesRouter.use(authJwt);

recurringInvoicesRouter.get("/invoices/recurring", async (_req, res, next) => {
  try {
    const data = await recurringInvoiceService.list();
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

recurringInvoicesRouter.post(
  "/invoices/recurring",
  validateBody(recurringInvoiceCreateSchema),
  async (req, res, next) => {
    try {
      const data = await recurringInvoiceService.create(req.body);
      res.status(201).json({ data });
    } catch (e) {
      next(e);
    }
  },
);

recurringInvoicesRouter.patch(
  "/invoices/recurring/:id",
  validateBody(recurringInvoiceUpdateSchema),
  async (req, res, next) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await recurringInvoiceService.update(id, req.body);
      res.json({ data });
    } catch (e) {
      next(e);
    }
  },
);

recurringInvoicesRouter.delete("/invoices/recurring/:id", async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await recurringInvoiceService.remove(id);
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

