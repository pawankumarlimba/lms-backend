import { Types } from "mongoose";
import { IBaseDocument } from "@core/base/BaseSchema";
import { LoanStatus } from "@constants/loan-status.enum";

export interface ISalarySlip {
  url: string;
  publicId: string;
  mimeType: string;
  sizeBytes: number;
}

export interface ILoanApplication extends IBaseDocument {
  borrowerId: Types.ObjectId;
  borrowerProfileId: Types.ObjectId;
  salarySlip: ISalarySlip;

  principal: number;
  tenureDays: number;
  interestRate: number; // % p.a., fixed at 12 but stored for auditability
  simpleInterest: number;
  totalRepayment: number;

  totalPaid: number;
  outstandingAmount: number;

  status: LoanStatus;

  rejectionReason?: string;
  sanctionedBy?: Types.ObjectId;
  sanctionedAt?: Date;
  disbursedBy?: Types.ObjectId;
  disbursedAt?: Date;
  closedAt?: Date;
}
