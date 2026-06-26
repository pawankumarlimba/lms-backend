import { Schema } from "mongoose";
import { createBaseSchema } from "../../core/base/BaseSchema";
import { IBorrowerProfile } from "../../models/BorrowerProfile/borrower-profile.types";
import { EmploymentMode } from "../../constants/employment-mode.enum";

const breRuleResultSchema = new Schema(
  {
    rule: { type: String, required: true },
    passed: { type: Boolean, required: true },
    reason: { type: String },
  },
  { _id: false }
);

export const borrowerProfileSchema = createBaseSchema<IBorrowerProfile>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  panNumber: { type: String, required: true, uppercase: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  monthlySalary: { type: Number, required: true, min: 0 },
  employmentMode: { type: String, enum: Object.values(EmploymentMode), required: true },
  breStatus: { type: String, enum: ["PASSED", "REJECTED"], required: true },
  breResults: { type: [breRuleResultSchema], default: [] },
  breEvaluatedAt: { type: Date, required: true },
});
