/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import { app } from "../server/src/app";

export default function handler(req: any, res: any) {
  // Express apps are (req, res) handlers
  return app(req as any, res as any);
}

