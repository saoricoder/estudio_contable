"use strict";
/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, _req, res, _next) {
    const status = typeof err === "object" && err !== null && "status" in err
        ? Number(err.status)
        : 500;
    const message = err instanceof Error ? err.message : "Unexpected error";
    res.status(Number.isFinite(status) ? status : 500).json({ error: { message } });
}
