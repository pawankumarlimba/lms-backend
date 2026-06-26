import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "@config/env.config";
import { Role } from "@constants/role.enum";
import { UnauthorizedError } from "@core/errors/ApiError";

export interface IJwtPayload {
  userId: string;
  role: Role;
}

/**
 * JwtService is the only place that knows how tokens are signed/verified.
 * AuthService and the auth middleware both depend on this abstraction
 * instead of calling the jsonwebtoken library directly.
 */
export class JwtService {
  public sign(payload: IJwtPayload): string {
    const options: SignOptions = { expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"] };
    return jwt.sign(payload, config.jwtSecret, options);
  }

  public verify(token: string): IJwtPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as IJwtPayload;
    } catch {
      throw new UnauthorizedError("Invalid or expired session token");
    }
  }
}
