import { IBreRule } from "../../../services/bre/IBreRule";
import { PersonalDetailsDto } from "../../../dto/loan/personal-details.dto";
import { IBreRuleResult } from "../../../models/BorrowerProfile/borrower-profile.types";

const MIN_AGE = 23;
const MAX_AGE = 50;

function calculateAge(dateOfBirth: Date, asOf: Date = new Date()): number {
  let age = asOf.getFullYear() - dateOfBirth.getFullYear();
  const hasNotHadBirthdayYet =
    asOf.getMonth() < dateOfBirth.getMonth() ||
    (asOf.getMonth() === dateOfBirth.getMonth() && asOf.getDate() < dateOfBirth.getDate());
  if (hasNotHadBirthdayYet) age -= 1;
  return age;
}

export class AgeRule implements IBreRule {
  public readonly name = "AGE";

  public evaluate(input: PersonalDetailsDto): IBreRuleResult {
    const age = calculateAge(new Date(input.dateOfBirth));
    const passed = age >= MIN_AGE && age <= MAX_AGE;
    return {
      rule: this.name,
      passed,
      reason: passed
        ? undefined
        : `Applicant age (${age}) must be between ${MIN_AGE} and ${MAX_AGE} years`,
    };
  }
}
