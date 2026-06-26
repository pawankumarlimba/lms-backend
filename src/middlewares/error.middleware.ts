import { NextFunction, Request, Response } from "express";
import { ApiError } from "../core/errors/ApiError";
import { HttpStatus } from "../constants/http-status.enum";
import { logger } from "../utils/logger";
import { isProduction } from "../config/env.config";

/** 404 handler for routes that don't exist at all. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

/**
 * Must be registered LAST in app.ts (after all routes). Express recognises
 * it as an error handler purely from its 4-argument signature.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    if (!err.isOperational) {
      logger.error(`Non-operational error: ${err.message}\n${err.stack}`);
    }
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
    return;
  }

  // Mongoose duplicate key error
  if ((err as any)?.code === 11000) {
    const field = Object.keys((err as any).keyPattern ?? {})[0] ?? "field";
    res.status(HttpStatus.CONFLICT).json({
      success: false,
      message: `Duplicate value for ${field} - it must be unique`,
    });
    return;
  }

  logger.error(`Unhandled error: ${err.message}\n${err.stack}`);
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: isProduction ? "Something went wrong" : err.message,
  });
}
