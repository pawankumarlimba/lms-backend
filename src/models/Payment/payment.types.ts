import { Types } from "mongoose";
import { IBaseDocument } from "@core/base/BaseSchema";

export interface IPayment extends IBaseDocument {
  loanApplicationId: Types.ObjectId;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
  recordedBy: Types.ObjectId;
}
