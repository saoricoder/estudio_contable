"use strict";
/*
 * Desarrollado por: Saori Coder
 * Contacto: https://instagram.com/saoricoder
 * Proyecto: Estudio Contable Eficiente - Contadores Unidos MX
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../config/prisma");
const env_1 = require("../../config/env");
class AuthService {
    async register(input) {
        const existing = await prisma_1.prisma.user.findUnique({
            where: { email: input.email },
            select: { id: true },
        });
        if (existing) {
            const err = new Error("Email already registered");
            err.status = 409;
            throw err;
        }
        const passwordHash = await bcrypt_1.default.hash(input.password, 12);
        const user = await prisma_1.prisma.user.create({
            data: { email: input.email, passwordHash },
            select: { id: true, email: true },
        });
        return { user, token: this.signToken({ sub: user.id, email: user.email }) };
    }
    async login(input) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: input.email },
            select: { id: true, email: true, passwordHash: true },
        });
        if (!user) {
            const err = new Error("Invalid credentials");
            err.status = 401;
            throw err;
        }
        const ok = await bcrypt_1.default.compare(input.password, user.passwordHash);
        if (!ok) {
            const err = new Error("Invalid credentials");
            err.status = 401;
            throw err;
        }
        return { user: { id: user.id, email: user.email }, token: this.signToken({ sub: user.id, email: user.email }) };
    }
    signToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, { expiresIn: "7d" });
    }
}
exports.AuthService = AuthService;
