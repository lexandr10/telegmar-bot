import bcrypt from "bcrypt";
import { AdminUserModel } from "../models/AdminUser";
import HttpError from "../helpers/httpError";
import {
  signAccessToken,
  signRefreshToken,
  hashRefreshToken,
  compareRefreshToken,
  verifyRefreshToken,
	RefreshPayload,
} from "./token.service";
import compareHash from "../helpers/comparePass";


export class AdminAuthService {
  static async login(email: string, password: string) {
    const admin = await AdminUserModel.findOne({ email });
    if (!admin) throw HttpError(401, "Invalid credentials");

    const comparePass = await compareHash(password, admin.passwordHash);
    if (!comparePass) throw HttpError(401, "Invalid credentials");
    const accessToken = signAccessToken({
      sub: String(admin._id),
      email: admin.email,
      roles: admin.roles,
    });

    const refreshToken = signRefreshToken(String(admin._id));
    admin.refreshTokenHash = await hashRefreshToken(refreshToken);
    await admin.save();

    return { accessToken, refreshToken };
  }

  static async refresh(refreshToken: string) {
    const decode: RefreshPayload = verifyRefreshToken(refreshToken);
    if (!decode) {
      throw HttpError(401, "Invalid refresh token");
    }
    const admin = await AdminUserModel.findById(decode.sub);
    if (!admin) throw HttpError(401, "Invalid refresh token");

    const matches = await compareRefreshToken(
      refreshToken,
      admin.refreshTokenHash
    );
    if (!matches) throw HttpError(401, "Invalid refresh token");

    const accessToken = signAccessToken({
      sub: String(admin._id),
      email: admin.email,
      roles: admin.roles,
    });

    const newRefreshToken = signRefreshToken(String(admin._id));
    admin.refreshTokenHash = await hashRefreshToken(newRefreshToken);
    await admin.save();

    return { accessToken, refreshToken: newRefreshToken };
  }

  static async logout(userId: string) {
    const admin = await AdminUserModel.findById(userId);
    if (!admin) throw HttpError(404, "Admin not found");
    admin.refreshTokenHash = null;
    await admin.save();
    return { ok: true };
  }

  static async me(userId: string) {
    const admin = await AdminUserModel.findById(userId)
      .select("_id email roles createdAt updatedAt")
      .lean();
    if (!admin) throw HttpError(404, "Admin not found");
    return admin;
  }
}