import { Router } from "express";
import { SanctionController } from "@controllers/sanction.controller";
import { authenticate } from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/rbac.middleware";
import { validateBody } from "@middlewares/validate.middleware";
import { RejectLoanDto } from "@dto/loan/reject-loan.dto";
import { Role } from "@constants/role.enum";
import { asyncHandler } from "@core/http/asyncHandler";

const router = Router();
const controller = new SanctionController();

router.use(authenticate, authorize(Role.SANCTION));

router.get("/applied", asyncHandler(controller.getAppliedLoans));
router.patch("/:loanId/sanction", asyncHandler(controller.sanctionLoan));
router.patch("/:loanId/reject", validateBody(RejectLoanDto), asyncHandler(controller.rejectLoan));

export const sanctionRouter = router;
