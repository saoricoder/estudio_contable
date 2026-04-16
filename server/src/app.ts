/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */

import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./http/middlewares/errorHandler";
import { authRouter } from "./http/routes/auth.routes";
import { clientsRouter } from "./http/routes/clients.routes";
import { healthRouter } from "./http/routes/health.routes";
import { payrollRouter } from "./http/routes/payroll.routes";
import { recurringInvoicesRouter } from "./http/routes/recurringInvoices.routes";
import { bankingRouter } from "./http/routes/banking.routes";
import { declarationsRouter } from "./http/routes/declarations.routes";
import { alertsRouter } from "./http/routes/alerts.routes";
import { reportsRouter } from "./http/routes/reports.routes";
import { analyticsRouter } from "./http/routes/analytics.routes";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

if (process.env.DEBUG_API_TRACE === "1") {
  app.use((req, _res, next) => {
    console.log(
      `[api-trace] ${req.method} url=${req.url} originalUrl=${String(req.originalUrl ?? "")}`,
    );
    next();
  });
}

/** Diagnóstico en Vercel: abre GET /api/_debug/routing en el navegador (sin secretos). */
app.get("/api/_debug/routing", (req, res) => {
  res.json({
    ok: true,
    step: "express-handler-reached",
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    path: req.path,
    vercel: Boolean(process.env.VERCEL),
    time: new Date().toISOString(),
  });
});

app.get("/", (_req, res) => {
  res.json({ ok: true, name: "Estudio Contable Eficiente API" });
});

app.use("/api", authRouter);
app.use("/api", healthRouter);
app.use("/api", clientsRouter);
app.use("/api", payrollRouter);
app.use("/api", recurringInvoicesRouter);
app.use("/api", bankingRouter);
app.use("/api", declarationsRouter);
app.use("/api", alertsRouter);
app.use("/api", reportsRouter);
app.use("/api", analyticsRouter);

app.use(errorHandler);

