import { Router } from "express";
import { AuthController } from "@controllers/auth.controller";
import { authenticate } from "@middlewares/auth.middleware";
import { validateBody } from "@middlewares/validate.middleware";
import { SignupDto } from "@dto/auth/signup.dto";
import { LoginDto } from "@dto/auth/login.dto";
import { asyncHandler } from "@core/http/asyncHandler";

const router = Router();
const controller = new AuthController();

router.post("/signup", validateBody(SignupDto), asyncHandler(controller.signup));
router.post("/login", validateBody(LoginDto), asyncHandler(controller.login));
router.post("/logout", asyncHandler(controller.logout));
router.get("/me", authenticate, asyncHandler(controller.me));

export const authRouter = router;
