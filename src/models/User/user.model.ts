import { model } from "mongoose";
import { IUser } from "@models/User/user.types";
import { userSchema } from "@models/User/user.schema";

export const UserModel = model<IUser>("User", userSchema);
