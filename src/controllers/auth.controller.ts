import { Request, Response } from "express";
import { BaseController } from "@core/base/BaseController";
import { AuthService } from "@services/auth.service";
import { SignupDto } from "@dto/auth/signup.dto";
import { LoginDto } from "@dto/auth/login.dto";
import { config, isProduction } from "@config/env.config";

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService = new AuthService()) {
    super();
  }

  public signup = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.authService.signup(req.body as SignupDto);
    this.setAuthCookie(res, result.token);
    return this.created(res, "Account created successfully", result);
  };

  public login = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.authService.login(req.body as LoginDto);
    this.setAuthCookie(res, result.token);
    return this.ok(res, "Logged in successfully", result);
  };

  public logout = async (_req: Request, res: Response): Promise<Response> => {
    res.clearCookie(config.jwtCookieName);
    return this.ok(res, "Logged out successfully");
  };

  public me = async (req: Request, res: Response): Promise<Response> => {
    const user = await this.authService.getProfile(req.user!.userId);
    return this.ok(res, "Profile fetched", user);
  };

  private setAuthCookie(res: Response, token: string): void {
    res.cookie(config.jwtCookieName, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: COOKIE_MAX_AGE_MS,
    });
  }
}
