import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength } from "class-validator";
import { Role } from "../../constants/role.enum";

/**
 * Public signup is borrower-only - executives are provisioned via the seed
 * script / Admin, never self-registered. That's why `role` is not accepted
 * here at all (prevents privilege escalation via signup payload).
 */
export class SignupDto {
  @IsString()
  @MinLength(2, { message: "Full name must be at least 2 characters" })
  fullName!: string;

  @IsEmail({}, { message: "Provide a valid email address" })
  email!: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: "Password must contain at least one letter and one number",
  })
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

/** Used internally by the seed script only, where role IS controlled. */
export class CreateUserInternalDto extends SignupDto {
  @IsEnum(Role)
  role!: Role;
}
