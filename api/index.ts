/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 *
 * Vercel (Node / @vercel/node): exportar la app Express como default.
 * En `vercel.json` se reescribe `/api/(.*)` → `/api` para que `/api/auth/*`, `/api/health`, etc.
 * lleguen al mismo handler.
 */

import type { Application } from "express";
import { app } from "../server/src/app";

const expressApp = app as Application;
export default expressApp;
