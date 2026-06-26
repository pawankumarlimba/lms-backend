import { IsInt, Max, Min } from "class-validator";

export class ApplyLoanDto {
  @IsInt()
  @Min(50_000, { message: "Loan amount must be at least ₹50,000" })
  @Max(500_000, { message: "Loan amount cannot exceed ₹5,00,000" })
  principal!: number;

  @IsInt()
  @Min(30, { message: "Tenure must be at least 30 days" })
  @Max(365, { message: "Tenure cannot exceed 365 days" })
  tenureDays!: number;
}
