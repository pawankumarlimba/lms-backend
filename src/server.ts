import "reflect-metadata";
import { App } from "./app";
import { config } from "../src/config/env.config";
import { Database } from "../src/core/database/Database";
import { logger } from "../src/utils/logger";

async function bootstrap(): Promise<void> {
  const database = Database.getInstance();
  await database.connect();

  const app = new App();
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

bootstrap().catch((error) => {
  logger.error(`Failed to bootstrap application: ${(error as Error).message}`);
  process.exit(1);
});
