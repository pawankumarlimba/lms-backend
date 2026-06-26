import { Router } from "express";
import { DisbursementController } from "@controllers/disbursement.controller";
import { authenticate } from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/rbac.middleware";
import { Role } from "@constants/role.enum";
import { asyncHandler } from "@core/http/asyncHandler";

const router = Router();
const controller = new DisbursementController();

router.use(authenticate, authorize(Role.DISBURSEMENT));

router.get("/sanctioned", asyncHandler(controller.getSanctionedLoans));
router.patch("/:loanId/disburse", asyncHandler(controller.disburseLoan));

export const disbursementRouter = router;
