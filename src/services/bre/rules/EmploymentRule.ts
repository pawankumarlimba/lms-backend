import { IBreRule } from "@services/bre/IBreRule";
import { PersonalDetailsDto } from "@dto/loan/personal-details.dto";
import { IBreRuleResult } from "@models/BorrowerProfile/borrower-profile.types";
import { EmploymentMode } from "@constants/employment-mode.enum";

export class EmploymentRule implements IBreRule {
  public readonly name = "EMPLOYMENT";

  public evaluate(input: PersonalDetailsDto): IBreRuleResult {
    const passed = input.employmentMode !== EmploymentMode.UNEMPLOYED;
    return {
      rule: this.name,
      passed,
      reason: passed ? undefined : "Unemployed applicants are not eligible for a loan",
    };
  }
}
