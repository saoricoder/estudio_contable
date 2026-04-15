import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";

export class AuthService {
  async register(input: { email: string; password: string }) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });
    if (existing) {
      const err = new Error("Email already registered");
      (err as any).status = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: { email: input.email, passwordHash },
      select: { id: true, email: true },
    });

    return { user, token: this.signToken({ sub: user.id, email: user.email }) };
  }

  async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true, email: true, passwordHash: true },
    });
    if (!user) {
      const err = new Error("Invalid credentials");
      (err as any).status = 401;
      throw err;
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      const err = new Error("Invalid credentials");
      (err as any).status = 401;
      throw err;
    }

    return { user: { id: user.id, email: user.email }, token: this.signToken({ sub: user.id, email: user.email }) };
  }

  private signToken(payload: { sub: string; email: string }) {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
  }
}

