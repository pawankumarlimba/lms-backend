import { IsDateString, IsNumber, IsString, Min, MinLength } from "class-validator";

export class RecordPaymentDto {
  @IsString()
  @MinLength(4, { message: "UTR number looks too short" })
  utrNumber!: string;

  @IsNumber()
  @Min(1, { message: "Payment amount must be greater than 0" })
  amount!: number;

  @IsDateString({}, { message: "Payment date must be a valid date (YYYY-MM-DD)" })
  paymentDate!: string;
}
