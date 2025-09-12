import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import {
  verifyAccessToken
} from "../services/token.service";
import HttpError from "../helpers/httpError";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;
  if (!authorization) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "Missing access token" });
  }
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer" || !token) {
    return next(HttpError(401, "Invalid authorization format"));
  }
  try {
    const { sub, email, roles } = verifyAccessToken(token);
    if (!sub || !email || !Array.isArray(roles)) {
      return next(HttpError(401, "Invalid token"));
    }
    req.user = {
      sub: String(sub),
      email: String(email),
      roles: roles.map(String),
		};
		req.token = token
    return next();
  } catch (err: any) {
    if (err?.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "TokenExpired", message: "Access token expired" });
    }
    if (err?.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Unauthorized", message: "Invalid access token" });
    }
    logger.warn({ err }, "authenticate error");
    return res.status(401).json({ error: "Unauthorized" });
  }
}
