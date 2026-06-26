import { Router } from "express";
import { SalesController } from "@controllers/sales.controller";
import { authenticate } from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/rbac.middleware";
import { Role } from "@constants/role.enum";
import { asyncHandler } from "@core/http/asyncHandler";

const router = Router();
const controller = new SalesController();

router.use(authenticate, authorize(Role.SALES));

router.get("/leads", asyncHandler(controller.getLeads));

export const salesRouter = router;
