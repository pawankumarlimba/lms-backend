import { BaseRepository } from "../core/base/BaseRepository";
import { IPayment } from "../models/Payment/payment.types";
import { PaymentModel } from "../models/Payment/payment.model";

export class PaymentRepository extends BaseRepository<IPayment> {
  constructor() {
    super(PaymentModel);
  }

  public async findByUtr(utrNumber: string): Promise<IPayment | null> {
    return this.model.findOne({ utrNumber: utrNumber.toUpperCase(), isDeleted: false });
  }

  public async findByLoanApplication(loanApplicationId: string) {
    return this.findAll({ loanApplicationId });
  }

  public async sumPaidForLoan(loanApplicationId: string): Promise<number> {
    const result = await this.model.aggregate<{ total: number }>([
      { $match: { loanApplicationId: this.model.base.Types.ObjectId.createFromHexString(loanApplicationId), isDeleted: false } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return result[0]?.total ?? 0;
  }
}
