import { model } from "mongoose";
import { IPayment } from "@models/Payment/payment.types";
import { paymentSchema } from "@models/Payment/payment.schema";

export const PaymentModel = model<IPayment>("Payment", paymentSchema);
