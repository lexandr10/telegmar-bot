import { bot } from "./index";
import { env } from "../env";
import { logger } from "../utils/logger";

export async function bootstrapBot(app: import("express").Express) {
  if (env.BOT_USE_POLLING === true || String(env.BOT_USE_POLLING) === "true") {
    // Polling-режим (локально)
    await bot.launch();
    logger.info("🤖 Bot started in polling mode");
    return;
  }

  // Webhook-режим
  const path = `/telegram/webhook/${env.WEBHOOK_SECRET}`;
  const url = `${env.PUBLIC_URL}${path}`;

  // Реєструємо маршрут у Express
  app.post(path, (req, res) => {
    // Проксіюємо запит у Telegraf
    (bot.webhookCallback(path) as any)(req, res);
  });

  // Ставимо вебхук
  await bot.telegram.setWebhook(url);
  logger.info({ url }, "🤖 Bot webhook set");

  // Немає потреби запускати bot.launch() у webhook-режимі
}
