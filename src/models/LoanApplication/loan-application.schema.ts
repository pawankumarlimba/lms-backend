import { Schema } from "mongoose";
import { createBaseSchema } from "../../core/base/BaseSchema";
import { ILoanApplication } from "../../models/LoanApplication/loan-application.types";
import { LoanStatus } from "../../constants/loan-status.enum";

const salarySlipSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
  },
  { _id: false }
);

export const loanApplicationSchema = createBaseSchema<ILoanApplication>({
  borrowerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  borrowerProfileId: {
    type: Schema.Types.ObjectId,
    ref: "BorrowerProfile",
    required: true,
  },
  salarySlip: { type: salarySlipSchema, required: true },

  principal: { type: Number, required: true, min: 50_000, max: 500_000 },
  tenureDays: { type: Number, required: true, min: 30, max: 365 },
  interestRate: { type: Number, required: true, default: 12 },
  simpleInterest: { type: Number, required: true },
  totalRepayment: { type: Number, required: true },

  totalPaid: { type: Number, required: true, default: 0 },
  outstandingAmount: { type: Number, required: true },

  status: {
    type: String,
    enum: Object.values(LoanStatus),
    required: true,
    default: LoanStatus.APPLIED,
    index: true,
  },

  rejectionReason: { type: String },
  sanctionedBy: { type: Schema.Types.ObjectId, ref: "User" },
  sanctionedAt: { type: Date },
  disbursedBy: { type: Schema.Types.ObjectId, ref: "User" },
  disbursedAt: { type: Date },
  closedAt: { type: Date },
});
