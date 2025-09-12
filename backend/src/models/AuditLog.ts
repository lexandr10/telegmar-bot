import { Schema, model, InferSchemaType, Types } from "mongoose";
import {
  setRunValidatorsAndNew,
  handleSaveOrUpdateError,
} from "../models/hooks";

const AuditLogSchema = new Schema(
  {
    actorUserId: { type: Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    target: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

AuditLogSchema.pre("findOneAndUpdate", setRunValidatorsAndNew);
AuditLogSchema.post("findOneAndUpdate", handleSaveOrUpdateError as any);
AuditLogSchema.post("save", handleSaveOrUpdateError as any);

export type AuditLogDoc = InferSchemaType<typeof AuditLogSchema>;
export const AuditLogModel = model("AuditLog", AuditLogSchema);