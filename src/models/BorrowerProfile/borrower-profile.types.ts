import { Types } from "mongoose";
import { IBaseDocument } from "@core/base/BaseSchema";
import { EmploymentMode } from "@constants/employment-mode.enum";

export interface IBreRuleResult {
  rule: string;
  passed: boolean;
  reason?: string;
}

export interface IBorrowerProfile extends IBaseDocument {
  userId: Types.ObjectId;
  panNumber: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  breStatus: "PASSED" | "REJECTED";
  breResults: IBreRuleResult[];
  breEvaluatedAt: Date;
}
