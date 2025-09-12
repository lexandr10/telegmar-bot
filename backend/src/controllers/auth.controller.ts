import { Request, Response } from "express";

import ctrlWrapper from "../decorators/ctrlWrapper";
import HttpError from "../helpers/httpError";
import { AdminAuthService } from "../services/adminAuth.service";
import { setRefreshCookie, clearRefreshCookie } from "../utils/cookies";
import { env } from "../env";

export const loginController = ctrlWrapper(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const { accessToken, refreshToken } = await AdminAuthService.login(
    email,
    password
	);


  setRefreshCookie(res, refreshToken);

  res.json({ accessToken });
});

export const refreshController = ctrlWrapper(async (req: Request, res: Response) => {
	const cookieName = env.COOKIE_NAME
	const refreshToken = req.cookies?.[cookieName]
	if (!refreshToken) throw HttpError(401, "No refresh token cookie");

	const { accessToken, refreshToken: newRefreshToken } = await AdminAuthService.refresh(
    refreshToken
	);
	
	setRefreshCookie(res, newRefreshToken)

	res.json({accessToken})
})

export const logoutController = ctrlWrapper(async (req: any, res: Response) => {
  const userId = req.user?.sub as string | undefined;
  if (!userId) throw HttpError(401, "Unauthorized");

  await AdminAuthService.logout(userId);
  clearRefreshCookie(res);
  res.json({ ok: true });
});

export const meController = ctrlWrapper(async (req: any, res: Response) => {
  const userId = req.user?.sub as string | undefined;
  if (!userId) throw HttpError(401, "Unauthorized");
  const me = await AdminAuthService.me(userId);
  res.json(me);
});
