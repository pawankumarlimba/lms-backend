import { IBreRule } from "@services/bre/IBreRule";
import { PersonalDetailsDto } from "@dto/loan/personal-details.dto";
import { IBreRuleResult } from "@models/BorrowerProfile/borrower-profile.types";

const MIN_MONTHLY_SALARY = 25_000;

export class SalaryRule implements IBreRule {
  public readonly name = "SALARY";

  public evaluate(input: PersonalDetailsDto): IBreRuleResult {
    const passed = input.monthlySalary >= MIN_MONTHLY_SALARY;
    return {
      rule: this.name,
      passed,
      reason: passed
        ? undefined
        : `Monthly salary must be at least ₹${MIN_MONTHLY_SALARY.toLocaleString("en-IN")}`,
    };
  }
}
