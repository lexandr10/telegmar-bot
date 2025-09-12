import { Request, Response } from "express";

import ctrlWrapper from "../decorators/ctrlWrapper";
import { UserService } from "../services/user.service";

export const listUsers = ctrlWrapper(async (req: Request, res: Response) => {
	const { username, isAllowed, roles, page, limit } =
    req.validated?.query ?? req.query;

	const rolesArr =
    typeof roles === "string"
      ? roles.split(",").map((s: string) => s.trim())
			: roles;
	
	const data = await UserService.list(
    {
      username,
      isAllowed:
        typeof isAllowed === "string" ? isAllowed === "true" : isAllowed,
      roles: rolesArr,
    },
    {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    }
	);
	
	res.json(data)
});

export const upsertUserByTelegram = ctrlWrapper(
  async (req: Request, res: Response) => {
    const doc = await UserService.upsertByTelegram(req.body);
    res.status(201).json(doc);
  }
);

export const patchUser = ctrlWrapper(async (req: Request, res: Response) => {
  const doc = await UserService.patchById(req.params.id, req.body);
  res.json(doc);
});

export const deleteUser = ctrlWrapper(async (req: Request, res: Response) => {
  const doc = await UserService.deleteById(req.params.id);
  res.json(doc);
});
