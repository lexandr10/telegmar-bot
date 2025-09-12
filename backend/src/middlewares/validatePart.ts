import { Request, Response, NextFunction, RequestHandler } from "express";
import { ObjectSchema } from "joi";
import HttpError from "../helpers/httpError";

export const validateQuery =
  (schema: ObjectSchema): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) return next(HttpError(400, error.message));

    req.validated = { ...(req.validated ?? {}), query: value };
    next();
  };

export const validateParams =
  (schema: ObjectSchema): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) return next(HttpError(400, error.message));

    req.validated = { ...(req.validated ?? {}), params: value };
    next();
  };
