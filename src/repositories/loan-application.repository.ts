import { IPaginationParams } from "@core/base/BaseRepository";
import { BaseRepository } from "@core/base/BaseRepository";
import { ILoanApplication } from "@models/LoanApplication/loan-application.types";
import { LoanApplicationModel } from "@models/LoanApplication/loan-application.model";
import { LoanStatus } from "@constants/loan-status.enum";

export class LoanApplicationRepository extends BaseRepository<ILoanApplication> {
  constructor() {
    super(LoanApplicationModel);
  }

  public async findByStatus(status: LoanStatus, pagination: IPaginationParams = {}) {
    return this.find({ status }, { populate: { path: "borrowerId", select: "fullName email phone" }, ...pagination });
  }

  public async findByBorrower(borrowerId: string) {
    return this.findAll({ borrowerId });
  }

  public async findActiveBorrowerIds(): Promise<string[]> {
    const apps = await this.model.find({ isDeleted: false }).distinct("borrowerId");
    return apps.map((id) => id.toString());
  }

  public async findByIdWithDetails(id: string) {
    return this.model
      .findOne({ _id: id, isDeleted: false })
      .populate({ path: "borrowerId", select: "fullName email phone" })
      .populate({ path: "borrowerProfileId" })
      .populate({ path: "sanctionedBy", select: "fullName email" })
      .populate({ path: "disbursedBy", select: "fullName email" });
  }
}
