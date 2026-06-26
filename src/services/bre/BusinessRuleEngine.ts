import { IBreRule } from "@services/bre/IBreRule";
import { AgeRule } from "@services/bre/rules/AgeRule";
import { SalaryRule } from "@services/bre/rules/SalaryRule";
import { PanFormatRule } from "@services/bre/rules/PanFormatRule";
import { EmploymentRule } from "@services/bre/rules/EmploymentRule";
import { PersonalDetailsDto } from "@dto/loan/personal-details.dto";
import { IBreRuleResult } from "@models/BorrowerProfile/borrower-profile.types";

export interface IBreVerdict {
  status: "PASSED" | "REJECTED";
  results: IBreRuleResult[];
  failedReasons: string[];
}

/**
 * BusinessRuleEngine runs deliberately on the SERVER ONLY, even though the
 * frontend mirrors the same checks for instant UX feedback. Client-side
 * validation is trivially bypassable (devtools / direct API calls), so the
 * server is the single source of truth for eligibility - this is the
 * authoritative gate before a LoanApplication can ever be created.
 *
 * Adding a new rule = pushing a new IBreRule into the `rules` array below.
 * Nothing else in the codebase needs to change (Open/Closed Principle).
 */
export class BusinessRuleEngine {
  private readonly rules: IBreRule[] = [
    new AgeRule(),
    new SalaryRule(),
    new PanFormatRule(),
    new EmploymentRule(),
  ];

  public run(input: PersonalDetailsDto): IBreVerdict {
    const results = this.rules.map((rule) => rule.evaluate(input));
    const failedReasons = results.filter((r) => !r.passed).map((r) => r.reason as string);

    return {
      status: failedReasons.length === 0 ? "PASSED" : "REJECTED",
      results,
      failedReasons,
    };
  }
}
