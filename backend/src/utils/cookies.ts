import { Response } from "express";
import ms from "ms";
import { env } from "../env";

export function setRefreshCookie(res: Response, token: string) {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    domain: env.COOKIE_DOMAIN,
    path: "/api/auth", // Just for auth-routers
    maxAge:
      typeof env.REFRESH_JWT_EXPIRES_IN === "string"
        ? ms(env.REFRESH_JWT_EXPIRES_IN)
        : env.REFRESH_JWT_EXPIRES_IN * 1000,
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    domain: env.COOKIE_DOMAIN,
    path: "/api/auth",
  });
}
