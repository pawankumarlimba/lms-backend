import bcrypt from "bcryptjs";
import { createBaseSchema } from "@core/base/BaseSchema";
import { IUser } from "@models/User/user.types";
import { Role } from "@constants/role.enum";
import { config } from "@config/env.config";

export const userSchema = createBaseSchema<IUser>({
  fullName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: Object.values(Role), required: true, index: true },
  isActive: { type: Boolean, default: true },
  phone: { type: String, trim: true },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, config.bcryptSaltRounds);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};
