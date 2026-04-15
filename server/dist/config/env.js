"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const required = ["DATABASE_URL", "JWT_SECRET"];
for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required env var: ${key}`);
    }
}
exports.env = {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: Number(process.env.PORT ?? 4000),
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
};
