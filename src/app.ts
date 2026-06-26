import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "../src/config/env.config";
import { apiRouter } from "../src/routes/index.routes";
import { errorHandler, notFoundHandler } from "../src/middlewares/error.middleware";
import { logger } from "../src/utils/logger";

/**
 * App encapsulates the Express application as a class so middleware/route
 * wiring is testable and not scattered across a top-level script.
 */
export class App {
  public readonly instance: Application;

  constructor() {
    this.instance = express();
    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddlewares(): void {
    this.instance.use(helmet());
    this.instance.use(
      cors({
        origin: config.clientUrl,
        credentials: true,
      })
    );
    this.instance.use(express.json());
    this.instance.use(express.urlencoded({ extended: true }));
    this.instance.use(cookieParser());
    this.instance.use(
      morgan("combined", {
        stream: { write: (message: string) => logger.info(message.trim()) },
      })
    );
  }

  private configureRoutes(): void {
    this.instance.get("/health", (_req, res) => {
      res.status(200).json({ success: true, message: "LMS API is healthy" });
    });
    this.instance.use("/api", apiRouter);
  }

  private configureErrorHandling(): void {
    this.instance.use(notFoundHandler);
    this.instance.use(errorHandler);
  }
}

// Instantiate once and export the Express instance itself as default —
// Express apps are callable functions, which is what the platform expects.
const appInstance = new App();
export default appInstance.instance;