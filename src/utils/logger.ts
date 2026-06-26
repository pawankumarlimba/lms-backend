import winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `[${ts}] ${level}: ${stack || message}`;
});

// Vercel (and most serverless platforms) have a read-only filesystem except
// /tmp, and there's no persistent disk to read log files back from anyway.
// So file transports are only added when running outside that environment.
const isServerless = process.env.VERCEL === "1";

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: combine(colorize(), timestamp(), logFormat),
  }),
];

if (!isServerless) {
  transports.push(
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" })
  );
}

/**
 * Single logger instance for the whole app. Anything that wants to log
 * imports this instead of calling console.log directly, so log format /
 * transports can change in one place.
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), logFormat),
  transports,
});