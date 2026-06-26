import winston from "winston";
import { config } from "../config/env.config";

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `[${ts}] ${level}: ${stack || message}`;
});
const nodeEnv=config.nodeEnv
const isProd = nodeEnv === "production";

/**
 * Single logger instance for the whole app. Anything that wants to log
 * imports this instead of calling console.log directly, so log format /
 * transports can change in one place.
 *
 * File transports are skipped in production since the deploy environment's
 * filesystem is read-only (e.g. Lambda) — only the Console transport runs there,
 * and logs are expected to be captured by the platform (CloudWatch, etc).
 */
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: combine(colorize(), timestamp(), logFormat),
  }),
];

if (!isProd) {
  transports.push(
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" })
  );
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), logFormat),
  transports,
});