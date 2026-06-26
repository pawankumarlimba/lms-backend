import { Router } from "express";
import { authRouter } from "@routes/auth.routes";
import { borrowerRouter } from "@routes/borrower.routes";
import { salesRouter } from "@routes/sales.routes";
import { sanctionRouter } from "@routes/sanction.routes";
import { disbursementRouter } from "@routes/disbursement.routes";
import { collectionRouter } from "@routes/collection.routes";
import { adminRouter } from "@routes/admin.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/borrower", borrowerRouter);
router.use("/dashboard/sales", salesRouter);
router.use("/dashboard/sanction", sanctionRouter);
router.use("/dashboard/disbursement", disbursementRouter);
router.use("/dashboard/collection", collectionRouter);
router.use("/dashboard/admin", adminRouter);

export const apiRouter = router;
