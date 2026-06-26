import { IBaseDocument } from "@core/base/BaseSchema";
import { Role } from "@constants/role.enum";

export interface IUser extends IBaseDocument {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
  phone?: string;
  comparePassword(candidate: string): Promise<boolean>;
}
