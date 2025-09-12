import { FilterQuery, Types } from "mongoose";

import { UserModel, type UserDoc } from "../models/User";
import HttpError from "../helpers/httpError";
import {
  CreateOrUpdateByTelegramDto,
  ListResult,
  Pagination,
  PatchUserDto,
  UserQuery,
} from "../dto/user.dto";
import { Role, type RoleValue } from "../auth/roles";

function toObjectId(id: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw HttpError(400, "Invalid ObjectId format");
  }
  return new Types.ObjectId(id);
}

function buildFilter(query: UserQuery): FilterQuery<UserDoc> {
  const filter: FilterQuery<UserDoc> = {};

  if (typeof query.isAllowed === "boolean") {
    filter.isAllowed = query.isAllowed;
  }

  if (query.username && query.username.trim()) {
    filter.username = { $regex: query.username.trim(), $options: "i" };
  }

  if (Array.isArray(query.roles) && query.roles.length > 0) {
    filter.roles = { $in: query.roles as string[] };
  }

  return filter;
}

function normalizeRoles(roles?: RoleValue[]): RoleValue[] | undefined {
  if (roles === undefined) return undefined;
  if (!Array.isArray(roles) || roles.length === 0) return [Role.USER];
  return roles;
}

export class UserService {
  static async getById(id: string) {
    const _id = toObjectId(id);
    const doc = await UserModel.findById(_id).lean<UserDoc>().exec();
    if (!doc) throw HttpError(404, "User not found");
    return doc;
  }

  static async getByTelegramId(telegramId: number) {
    const doc = await UserModel.findOne({ telegramId }).lean<UserDoc>().exec();
    if (!doc) throw HttpError(404, "User not found");
    return doc;
  }

  static async list(
    query: UserQuery = {},
    pagination: Pagination = {}
  ): Promise<ListResult<UserDoc>> {
    const { page = 1, limit = 20 } = pagination;
    const safePage = Math.max(1, Math.min(page, 1e9));
    const safeLimit = Math.max(1, Math.min(limit, 200));
    const filter = buildFilter(query);

    const [items, total] = await Promise.all([
      UserModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean<UserDoc[]>()
        .exec(),
      UserModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      pages: Math.max(1, Math.ceil(total / safeLimit)),
    };
  }

  static async upsertByTelegram(dto: CreateOrUpdateByTelegramDto) {
    const { telegramId, username, isAllowed } = dto;
    const roles = normalizeRoles(dto.roles);

    if (!telegramId || telegramId <= 0) {
      throw HttpError(400, "telegramId is required and must be > 0");
    }

    const update: Partial<UserDoc> = {};
    if (typeof username === "string") update.username = username;
    if (typeof isAllowed === "boolean") update.isAllowed = isAllowed;
    if (roles) update.roles = roles;
    const doc = await UserModel.findOneAndUpdate(
      { telegramId },
      { $set: update }
    )
      .lean<UserDoc>()
      .exec();

    return doc;
  }

  static async ensureAllowed(telegramId: number, username?: string) {
    if (!telegramId || telegramId <= 0) {
      throw HttpError(400, "telegramId is required and must be > 0");
    }
    const doc = await UserModel.findOneAndUpdate(
      { telegramId },
      {
        $set: { isAllowed: true, ...(username ? { username } : {}) },
        $setOnInsert: { roles: [Role.USER] },
      },
      { upsert: true }
    )
      .lean<UserDoc>()
      .exec();
    return doc;
  }

  static async revokeAccess(telegramId: number) {
    const doc = await UserModel.findByIdAndUpdate(
      { telegramId },
      { $set: { isAllowed: false } }
    )
      .lean<UserDoc>()
      .exec();
    if (!doc) throw HttpError(404, "User not found");
    return doc;
  }

  static async patchById(id: string, patch: PatchUserDto) {
    if (!patch || Object.keys(patch).length === 0) {
      throw HttpError(400, "Empty patch");
    }
    const _id = toObjectId(id);

    const $set: Partial<UserDoc> = { ...patch };
    if ("roles" in patch) {
      $set.roles = normalizeRoles(patch.roles)!;
    }

    const doc = await UserModel.findByIdAndUpdate(_id, { $set })
      .lean<UserDoc>()
      .exec();

    if (!doc) throw HttpError(404, "User not found");
    return doc;
  }

  static async deleteById(id: string) {
    const _id = toObjectId(id);
    const doc = await UserModel.findByIdAndDelete(_id).lean<UserDoc>().exec();
    if (!doc) throw HttpError(404, "User not found");
    return doc;
  }
}
