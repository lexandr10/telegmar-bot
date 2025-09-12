import { Request, Response } from "express";

import ctrlWrapper from "../decorators/ctrlWrapper";
import { bot } from "../bot";
import { env } from "../env";
import { formatHookMessage } from "../utils/requestInfo";

export const hookPublicGet = ctrlWrapper(
  async (req: Request, res: Response) => {
    const text = formatHookMessage(req);
    await bot.telegram.sendMessage(env.TELEGRAM_CHAT_ID as any, text, {
      parse_mode: "Markdown",
    });

    res.json({ ok: true });
  }
);

export const hookPublicPost = ctrlWrapper(
  async (req: Request, res: Response) => {
    const preview = (() => {
      try {
        return JSON.stringify(req.body).slice(0, 400);
      } catch {
        return "";
      }
    })();

    const text = formatHookMessage(req, preview);
    await bot.telegram.sendMessage(env.TELEGRAM_CHAT_ID as any, text, {
      parse_mode: "Markdown",
    });
    res.json({ ok: true });
  }
);
