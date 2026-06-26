import { BaseRepository } from "../core/base/BaseRepository";
import { IUser } from "../models/User/user.types";
import { UserModel } from "../models/User/user.model";
import { Role } from "../constants/role.enum";

/**
 * UserRepository extends BaseRepository to inherit create/find/update/delete
 * and adds only the queries that are specific to User (e.g. lookup by email,
 * lookup with password included for login).
 */
export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(UserModel);
  }

  public async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email: email.toLowerCase(), isDeleted: false });
  }

  /** Login needs the password hash, which is excluded by `select: false` by default. */
  public async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return this.model
      .findOne({ email: email.toLowerCase(), isDeleted: false })
      .select("+password");
  }

  public async findLeadsWithoutApplication(loanApplicationBorrowerIds: string[]) {
    return this.model.find({
      role: Role.BORROWER,
      isDeleted: false,
      _id: { $nin: loanApplicationBorrowerIds },
    });
  }
}
