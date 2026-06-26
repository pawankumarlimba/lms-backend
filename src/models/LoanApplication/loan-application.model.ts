import { model } from "mongoose";
import { ILoanApplication } from "@models/LoanApplication/loan-application.types";
import { loanApplicationSchema } from "@models/LoanApplication/loan-application.schema";

export const LoanApplicationModel = model<ILoanApplication>(
  "LoanApplication",
  loanApplicationSchema
);
