import { model } from "mongoose";
import { IBorrowerProfile } from "@models/BorrowerProfile/borrower-profile.types";
import { borrowerProfileSchema } from "@models/BorrowerProfile/borrower-profile.schema";

export const BorrowerProfileModel = model<IBorrowerProfile>(
  "BorrowerProfile",
  borrowerProfileSchema
);
