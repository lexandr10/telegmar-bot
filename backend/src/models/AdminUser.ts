import { Schema, model, InferSchemaType } from "mongoose";
import { setRunValidatorsAndNew, handleSaveOrUpdateError } from "../models/hooks";
import { Role } from "../auth/roles";

const AdminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    roles: { type: [String], default: [Role.ADMIN] },
		refreshTokenHash: { type: String, default: null, required: false},
  },
  { timestamps: true, versionKey: false }
);

AdminUserSchema.pre("findOneAndUpdate", setRunValidatorsAndNew);
AdminUserSchema.post("findOneAndUpdate", handleSaveOrUpdateError as any);
AdminUserSchema.post("save", handleSaveOrUpdateError as any);

export type AdminUserDoc = InferSchemaType<typeof AdminUserSchema>;
export const AdminUserModel = model("AdminUser", AdminUserSchema);