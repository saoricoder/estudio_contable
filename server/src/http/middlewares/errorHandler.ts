import type { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status =
    typeof err === "object" && err !== null && "status" in err
      ? Number((err as any).status)
      : 500;

  const message = err instanceof Error ? err.message : "Unexpected error";
  res.status(Number.isFinite(status) ? status : 500).json({ error: { message } });
}

