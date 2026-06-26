import { IsString, MinLength } from "class-validator";

export class RejectLoanDto {
  @IsString()
  @MinLength(5, { message: "Rejection reason must be at least 5 characters" })
  reason!: string;
}
