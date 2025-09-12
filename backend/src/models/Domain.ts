import { Schema, model, InferSchemaType, Types } from "mongoose";
import { setRunValidatorsAndNew, handleSaveOrUpdateError } from "../models/hooks";

const DomainSchema = new Schema({
	name: { type: String, required: true, unique: true, index: true },
	zoneId: { type: String },
	accountId: { type: String },
	nameservers: { type: [String], default: [] },
	createdBy: {type: Types.ObjectId, ref: 'User'}
}, { timestamps: true, versionKey: false })


DomainSchema.pre("findOneAndUpdate", setRunValidatorsAndNew);
DomainSchema.post("findOneAndUpdate", handleSaveOrUpdateError as any);
DomainSchema.post("save", handleSaveOrUpdateError as any);


export type DomainDoc = InferSchemaType<typeof DomainSchema>;
export const DomainModel = model("Domain", DomainSchema);