import dotenv from "dotenv";

dotenv.config();

interface IAppConfig {
  nodeEnv: string;
  port: number;
  clientUrl: string;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtCookieName: string;
  bcryptSaltRounds: number;
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
}

/**
 * Config is a singleton: the rest of the app never calls process.env directly.
 * This is the one place that knows how environment variables are named,
 * parsed and defaulted - everything else depends on this abstraction instead.
 */
class Config {
  private static instance: Config;
  public readonly values: IAppConfig;

  private constructor() {
    this.values = {
      nodeEnv: this.getString("NODE_ENV", "development"),
      port: this.getNumber("PORT", 5000),
      clientUrl: this.getString("CLIENT_URL", "http://localhost:3000"),
      mongoUri: this.getRequiredString("MONGO_URI"),
      jwtSecret: this.getRequiredString("JWT_SECRET"),
      jwtExpiresIn: this.getString("JWT_EXPIRES_IN", "7d"),
      jwtCookieName: this.getString("JWT_COOKIE_NAME", "lms_token"),
      bcryptSaltRounds: this.getNumber("BCRYPT_SALT_ROUNDS", 10),
      cloudinary: {
        cloudName: this.getRequiredString("CLOUDINARY_CLOUD_NAME"),
        apiKey: this.getRequiredString("CLOUDINARY_API_KEY"),
        apiSecret: this.getRequiredString("CLOUDINARY_API_SECRET"),
      },
    };
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  private getString(key: string, fallback: string): string {
    return process.env[key] ?? fallback;
  }

  private getRequiredString(key: string): string {
    const value = process.env[key];
    if (!value) {
      // Fail fast at boot rather than crashing later mid-request.
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  private getNumber(key: string, fallback: number): number {
    const raw = process.env[key];
    if (!raw) return fallback;
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  public get isProduction(): boolean {
    return this.values.nodeEnv === "production";
  }
}

export const config = Config.getInstance().values;
export const isProduction = Config.getInstance().isProduction;
