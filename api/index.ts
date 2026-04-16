/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 *
 * Vercel @vercel/node: exportar un handler (req, res). Algunas versiones no enlazan bien
 * `export default app` con Express.Application.
 * El rewrite `/api/*` → `/api` mantiene la ruta original en la petición hacia Express.
 */

import type { IncomingMessage, ServerResponse } from "http";
import { app } from "../server/src/app";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (process.env.DEBUG_API_TRACE === "1") {
    console.log(`[api] ${req.method} ${req.url}`);
  }
  return app(req as any, res as any);
}
