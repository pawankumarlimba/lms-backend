import mongoose from "mongoose";
import { config } from "@config/env.config";
import { logger } from "@utils/logger";

/**
 * Database is a singleton wrapping the single Mongoose connection used by
 * the entire application. No other file is allowed to call mongoose.connect
 * directly - this is the only door in.
 */
export class Database {
  private static instance: Database;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.warn("Database.connect() called but a connection already exists - ignoring.");
      return;
    }

    mongoose.set("strictQuery", true);

    try {
      await mongoose.connect(config.mongoUri);
      this.isConnected = true;
      logger.info(`MongoDB connected -> ${mongoose.connection.name}`);

      mongoose.connection.on("disconnected", () => {
        this.isConnected = false;
        logger.warn("MongoDB disconnected.");
      });

      mongoose.connection.on("error", (err) => {
        logger.error(`MongoDB connection error: ${err.message}`);
      });
    } catch (error) {
      logger.error(`MongoDB initial connection failed: ${(error as Error).message}`);
      // Fail fast - the app is useless without a DB.
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    await mongoose.disconnect();
    this.isConnected = false;
    logger.info("MongoDB connection closed.");
  }
}
