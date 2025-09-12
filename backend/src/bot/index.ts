import { Telegraf, Context, Markup } from "telegraf";

import { env } from "../env";
import { logger } from "../utils/logger";
import { UserModel } from "../models/User";
import { Role } from "../auth/roles";
import { registerCloudflareCommands } from "./commands.cf";
import { registerMetaCommands } from "./commands.meta";

export const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN as string);

bot.use(async (ctx, next) => {
  try {
    const chat = ctx.chat;
    const from = ctx.from;
    if (!chat || !from) return next();

    const isPrivate = chat.type === "private";
    const tgId = from.id;
    const username = from.username || undefined;

    if (isPrivate) {
      const existing = await UserModel.findOne({ telegramId: tgId }).lean();
      if (!existing) {
        await UserModel.create({
          telegramId: tgId,
          username: username,
          roles: [Role.USER],
          isAllowed: false,
        });
        await ctx.reply(
          "Привіт! Я вас зареєстрував. Наразі доступ до команд закритий — " +
            "адміністратор побачить вас у веб‑панелі та може видати доступ."
        );
        return;
      }

      await UserModel.updateOne({ telegramId: tgId }, { $set: { username } });

      if (!existing.isAllowed) {
        return;
      }
      return next();
		}

		if (String(chat.id) !== String(env.TELEGRAM_CHAT_ID)) {
      return; 
		}
		return next();
		

	} catch (err) {
		logger.warn({ err }, "bot middleware error");
	}
});

registerMetaCommands(bot);
registerCloudflareCommands(bot);

bot.start(async (ctx) => {
  await ctx.reply("Привіт! Напишіть /help");
});

bot.help(async (ctx) => {
  await ctx.reply("Команди: /help, /whoami");
});

bot.command("whoami", async (ctx) => {
  const f = ctx.from;
  await ctx.reply(
    `id: ${f?.id}\nusername: @${f?.username || "-"}\nname: ${
      f?.first_name || ""
    } ${f?.last_name || ""}`.trim()
  );
});

bot.catch((err, ctx) => {
  logger.error({ err }, "Telegraf error");
  try {
    ctx.reply?.("Вибачте, сталася помилка");
  } catch {}
});
