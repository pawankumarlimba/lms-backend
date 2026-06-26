import { Router } from "express";
import { BorrowerController } from "@controllers/borrower.controller";
import { authenticate } from "@middlewares/auth.middleware";
import { authorize, requireExactRole } from "@middlewares/rbac.middleware";
import { validateBody } from "@middlewares/validate.middleware";
import { salarySlipUpload } from "@middlewares/upload.middleware";
import { PersonalDetailsDto } from "@dto/loan/personal-details.dto";
import { ApplyLoanDto } from "@dto/loan/apply-loan.dto";
import { Role } from "@constants/role.enum";
import { asyncHandler } from "@core/http/asyncHandler";

const router = Router();
const controller = new BorrowerController();

// Every route here is borrower-only (Admin is intentionally NOT given a
// backdoor into the application portal - the spec scopes Admin to the
// dashboard modules, not the borrower journey).
router.use(authenticate, requireExactRole(Role.BORROWER));

router.post("/personal-details", validateBody(PersonalDetailsDto), asyncHandler(controller.submitPersonalDetails));

router.post(
  "/apply",
  salarySlipUpload,
  validateBody(ApplyLoanDto),
  asyncHandler(controller.applyForLoan)
);

router.get("/applications", asyncHandler(controller.getMyApplications));
router.get("/applications/:loanId", asyncHandler(controller.getApplicationById));

export const borrowerRouter = router;
