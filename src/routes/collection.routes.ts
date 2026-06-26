import { Router } from "express";
import { CollectionController } from "@controllers/collection.controller";
import { authenticate } from "@middlewares/auth.middleware";
import { authorize } from "@middlewares/rbac.middleware";
import { validateBody } from "@middlewares/validate.middleware";
import { RecordPaymentDto } from "@dto/payment/record-payment.dto";
import { Role } from "@constants/role.enum";
import { asyncHandler } from "@core/http/asyncHandler";

const router = Router();
const controller = new CollectionController();

router.use(authenticate, authorize(Role.COLLECTION));

router.get("/disbursed", asyncHandler(controller.getDisbursedLoans));
router.get("/:loanId", asyncHandler(controller.getLoanById));
router.post("/:loanId/payments", validateBody(RecordPaymentDto), asyncHandler(controller.recordPayment));
router.get("/:loanId/payments", asyncHandler(controller.getPaymentsForLoan));

export const collectionRouter = router;
