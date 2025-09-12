import type { CallbackWithoutResultAndOptionalError, Query } from "mongoose";


export function setRunValidatorsAndNew(
  this: Query<any, any>,
  next: CallbackWithoutResultAndOptionalError
) {
  this.setOptions({
    runValidators: true,
    new: true,
    context: "query",
  });
  next();
}

export function handleSaveOrUpdateError(
  err: any,
  _doc: any,
  next: CallbackWithoutResultAndOptionalError
) {
  if (err?.code === 11000) {
    const fields = Object.keys(err.keyPattern || {});
    const msg = fields.length
      ? `Duplicate value for unique field(s): ${fields.join(", ")}`
      : "Duplicate key error";
    return next(new Error(msg));
  }
  return next(err);
}