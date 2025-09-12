import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { env } from "../env";

export type AccessPayload = { sub: string; email: string; roles: string[] };
export type RefreshPayload = { sub: string; typ: "refresh" };

export function signAccessToken(payload: AccessPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.ACCESS_JWT_EXPIRES_IN,
  });
}

export function signRefreshToken(userId: string) {
  const payload: RefreshPayload = { sub: userId, typ: "refresh" };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.REFRESH_JWT_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessPayload;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as any;
  if (decoded?.typ !== "refresh") {
    throw new Error("Invalid refresh token type");
  }
  return decoded as RefreshPayload;
}

export async function hashRefreshToken(refreshToken: string): Promise<string> {
  return bcrypt.hash(refreshToken, 10);
}

export async function compareRefreshToken(
  refreshToken: string,
  refreshTokenHash: string | null | undefined
): Promise<boolean> {
  if (!refreshToken|| !refreshTokenHash) return false;
  return bcrypt.compare(refreshToken, refreshTokenHash);
}
