import { Schema, model, InferSchemaType } from "mongoose";
import { handleSaveOrUpdateError, setRunValidatorsAndNew } from "./hooks";
import { ALL_ROLES, Role } from "../auth/roles";

const UserSchema = new Schema(
  {
    telegramId: { type: Number, index: true, unique: true, sparse: true },
    username: { type: String, index: true },
    isAllowed: { type: Boolean, default: false },
    roles: { type: [String], enum: ALL_ROLES, default: [Role.USER] },
  },

  { timestamps: true, versionKey: false }
);

UserSchema.index({ username: 1 }, { unique: false });

UserSchema.pre("findOneAndUpdate", setRunValidatorsAndNew);
UserSchema.post("findOneAndUpdate", handleSaveOrUpdateError as any);
UserSchema.post("save", handleSaveOrUpdateError as any);

export type UserDoc = InferSchemaType<typeof UserSchema>;
export const UserModel = model("User", UserSchema);
