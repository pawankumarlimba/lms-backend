import { IsDateString, IsEnum, IsNumber, IsString, Matches, Min } from "class-validator";
import { EmploymentMode } from "@constants/employment-mode.enum";
import { PAN_REGEX } from "@utils/regex.util";

export class PersonalDetailsDto {
  @IsString()
  fullName!: string;

  @IsString()
  @Matches(PAN_REGEX, { message: "PAN must match the format ABCDE1234F" })
  panNumber!: string;

  @IsDateString({}, { message: "Date of birth must be a valid date (YYYY-MM-DD)" })
  dateOfBirth!: string;

  @IsNumber()
  @Min(0, { message: "Monthly salary cannot be negative" })
  monthlySalary!: number;

  @IsEnum(EmploymentMode, { message: "Employment mode must be SALARIED, SELF_EMPLOYED or UNEMPLOYED" })
  employmentMode!: EmploymentMode;
}
