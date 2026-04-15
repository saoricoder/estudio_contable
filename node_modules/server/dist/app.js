"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./http/middlewares/errorHandler");
const auth_routes_1 = require("./http/routes/auth.routes");
const clients_routes_1 = require("./http/routes/clients.routes");
const health_routes_1 = require("./http/routes/health.routes");
const payroll_routes_1 = require("./http/routes/payroll.routes");
const recurringInvoices_routes_1 = require("./http/routes/recurringInvoices.routes");
const banking_routes_1 = require("./http/routes/banking.routes");
exports.app = (0, express_1.default)();
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)({
    origin: env_1.env.CLIENT_ORIGIN,
    credentials: true,
}));
exports.app.use(express_1.default.json({ limit: "1mb" }));
exports.app.use((0, morgan_1.default)("dev"));
exports.app.get("/", (_req, res) => {
    res.json({ ok: true, name: "Estudio Contable Eficiente API" });
});
exports.app.use("/api", auth_routes_1.authRouter);
exports.app.use("/api", health_routes_1.healthRouter);
exports.app.use("/api", clients_routes_1.clientsRouter);
exports.app.use("/api", payroll_routes_1.payrollRouter);
exports.app.use("/api", recurringInvoices_routes_1.recurringInvoicesRouter);
exports.app.use("/api", banking_routes_1.bankingRouter);
exports.app.use(errorHandler_1.errorHandler);
