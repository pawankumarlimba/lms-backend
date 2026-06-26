import { NextFunction, Request, Response } from "express";
import { config } from "../config/env.config";
import { JwtService } from "../services/jwt.service";
import { UnauthorizedError } from "../core/errors/ApiError";

const jwtService = new JwtService();

function extractToken(req: Request): string | null {
  const fromCookie = req.cookies?.[config.jwtCookieName];
  if (fromCookie) return fromCookie;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }
  return null;
}

/**
 * authenticate populates req.user from a valid JWT. Every protected route
 * (everything except /auth/signup and /auth/login) goes through this first.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    return next(new UnauthorizedError("Authentication token missing"));
  }

  const payload = jwtService.verify(token);
  req.user = { userId: payload.userId, role: payload.role };
  next();
}
