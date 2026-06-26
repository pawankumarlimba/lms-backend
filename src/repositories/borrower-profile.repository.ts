import { BaseRepository } from "../core/base/BaseRepository";
import { IBorrowerProfile } from "../models/BorrowerProfile/borrower-profile.types";
import { BorrowerProfileModel } from "../models/BorrowerProfile/borrower-profile.model";

export class BorrowerProfileRepository extends BaseRepository<IBorrowerProfile> {
  constructor() {
    super(BorrowerProfileModel);
  }

  public async findByUserId(userId: string): Promise<IBorrowerProfile | null> {
    return this.model.findOne({ userId, isDeleted: false });
  }
}
