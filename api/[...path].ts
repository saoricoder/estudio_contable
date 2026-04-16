/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 *
 * Vercel: `api/index.ts` solo cubre el path exacto `/api`.
 * Este catch-all enruta **todas** las peticiones `/api/*` hacia Express.
 */

import { app } from "../server/src/app";

export default function handler(req: any, res: any) {
  if (process.env.DEBUG_API_TRACE === "1") {
    console.log(
      `[vercel-entry] method=${req.method} url=${req.url} originalUrl=${String(req.originalUrl ?? "")}`,
    );
  }
  return app(req as any, res as any);
}
