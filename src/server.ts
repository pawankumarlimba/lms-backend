import "reflect-metadata";
import { App } from "./app";
import { config } from "@config/env.config";
import { Database } from "@core/database/Database";
import { logger } from "@utils/logger";

const database = Database.getInstance();
const app = new App();

const isServerless = process.env.VERCEL === "1";

async function bootstrap(): Promise<void> {
  await database.connect();

  const server = app.instance.listen(config.port, () => {
    logger.info(`LMS API listening on port ${config.port} [${config.nodeEnv}]`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received - shutting down gracefully`);
    server.close(async () => {
      await database.disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

if (!isServerless) {
  bootstrap().catch((error) => {
    logger.error(`Failed to bootstrap application: ${(error as Error).message}`);
    process.exit(1);
  });
} else {
  // On Vercel: no listen(), Vercel invokes the exported app per-request.
  // Database.connect() should internally cache/reuse the connection
  // across warm invocations rather than reconnecting every time.
  database.connect().catch((error) => {
    logger.error(`Failed to connect database: ${(error as Error).message}`);
  });
}

export default app.instance;