import { Request, Response, NextFunction, RequestHandler } from "express";
import { ObjectSchema } from "joi";

import HttpError from "../helpers/httpError";

const validateBody = (schema: ObjectSchema): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(HttpError(400, error.message));
    }
    next();
  };
};

export default validateBody;
