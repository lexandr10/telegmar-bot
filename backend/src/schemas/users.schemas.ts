import Joi from "joi";
import { ALL_ROLES } from "../auth/roles";

export const listUsersQuerySchema = Joi.object({
  username: Joi.string().optional(),
  isAllowed: Joi.boolean().optional(),
  roles: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().valid(...ALL_ROLES)),
      Joi.string()
    )
    .optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(200).optional(),
});

export const upsertByTelegramSchema = Joi.object({
  telegramId: Joi.number().integer().min(1).required(),
  username: Joi.string().optional(),
  isAllowed: Joi.boolean().optional(),
  roles: Joi.array()
    .items(Joi.string().valid(...ALL_ROLES))
    .optional(),
});

export const patchUserParamsSchema = Joi.object({
  id: Joi.string().hex().required(),
});

export const patchUserBodySchema = Joi.object({
  username: Joi.string().optional(),
  isAllowed: Joi.boolean().optional(),
  roles: Joi.array()
    .items(Joi.string().valid(...ALL_ROLES))
    .optional(),
}).min(1);

export const deleteUserParamsSchema = Joi.object({
  id: Joi.string().hex().required(),
});
