import { Router } from "express";
import { AdminController } from "@controllers/admin.controller";
import { authenticate } from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/rbac.middleware";
import { Role } from "@constants/role.enum";
import { asyncHandler } from "@core/http/asyncHandler";

const router = Router();
const controller = new AdminController();

// authorize() with no extra roles still lets Role.ADMIN through (its
// universal bypass) and blocks everyone else - exactly what we want here.
router.use(authenticate, authorize(Role.ADMIN));

router.get("/overview", asyncHandler(controller.getOverview));

export const adminRouter = router;
