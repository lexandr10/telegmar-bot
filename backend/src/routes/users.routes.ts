import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";

import { Role } from "../auth/roles";
import emptyMiddleware from "../middlewares/emptyMiddleware";
import validateBody from "../decorators/validateBody";
import { validateQuery, validateParams } from "../middlewares/validatePart";
import {
  listUsersQuerySchema,
  upsertByTelegramSchema,
  patchUserParamsSchema,
  patchUserBodySchema,
  deleteUserParamsSchema,
} from "../schemas/users.schemas";
import {
  listUsers,
  upsertUserByTelegram,
  patchUser,
  deleteUser,
} from "../controllers/user.controller";
import { requireRoles } from "../middlewares/requireRoles";

export const usersRouter = Router();

usersRouter.use(authenticate, requireRoles([Role.ADMIN]));

usersRouter.get("/", validateQuery(listUsersQuerySchema), listUsers);

usersRouter.post(
  "/",
  emptyMiddleware,
  validateBody(upsertByTelegramSchema),
  upsertUserByTelegram
);

usersRouter.patch(
  "/:id",
  validateParams(patchUserParamsSchema),
  emptyMiddleware,
  validateBody(patchUserBodySchema),
  patchUser
);

usersRouter.delete("/:id", validateParams(deleteUserParamsSchema), deleteUser);