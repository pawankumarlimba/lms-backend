import { Schema } from "mongoose";
import { createBaseSchema } from "../../core/base/BaseSchema";
import { IPayment } from "../../models/Payment/payment.types";

export const paymentSchema = createBaseSchema<IPayment>({
  loanApplicationId: {
    type: Schema.Types.ObjectId,
    ref: "LoanApplication",
    required: true,
    index: true,
  },
  // Unique across ALL payments system-wide, per the spec - DB-level guarantee
  // backs up the service-level pre-check so we never race-condition a duplicate.
  utrNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
  amount: { type: Number, required: true, min: 1 },
  paymentDate: { type: Date, required: true },
  recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});
