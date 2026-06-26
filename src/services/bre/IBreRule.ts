import { PersonalDetailsDto } from "@dto/loan/personal-details.dto";
import { IBreRuleResult } from "@models/BorrowerProfile/borrower-profile.types";

/**
 * IBreRule is the Strategy interface for one Business Rule Engine check.
 * Adding a new eligibility rule later means writing ONE new class that
 * implements this interface and registering it with BusinessRuleEngine -
 * no existing rule or the engine itself needs to change (Open/Closed).
 */
export interface IBreRule {
  readonly name: string;
  evaluate(input: PersonalDetailsDto): IBreRuleResult;
}
