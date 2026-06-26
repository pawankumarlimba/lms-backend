import { IBreRule } from "../../../services/bre/IBreRule";
import { PersonalDetailsDto } from "../../../dto/loan/personal-details.dto";
import { IBreRuleResult } from "../../../models/BorrowerProfile/borrower-profile.types";
import { PAN_REGEX } from "../../../utils/regex.util";

export class PanFormatRule implements IBreRule {
  public readonly name = "PAN_FORMAT";

  public evaluate(input: PersonalDetailsDto): IBreRuleResult {
    const passed = PAN_REGEX.test(input.panNumber.toUpperCase());
    return {
      rule: this.name,
      passed,
      reason: passed ? undefined : "PAN does not match the valid format (ABCDE1234F)",
    };
  }
}
