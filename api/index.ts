import "reflect-metadata";
import app from "../src/app";
import { Database } from "../src/core/database/Database";
import { logger } from "../src/utils/logger";

let dbConnected = false;

async function ensureDb(): Promise<void> {
  if (dbConnected) return;
  const database = Database.getInstance();
  await database.connect();
  dbConnected = true;
  logger.info("Database connected (cold start)");
}

export default async function handler(req: any, res: any) {
  await ensureDb();
  return (app as any)(req, res);
}