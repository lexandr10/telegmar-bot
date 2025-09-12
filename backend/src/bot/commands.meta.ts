import { Telegraf } from "telegraf";
import { CloudflareService } from "../services/cloudflare.service";
import { codeBlock } from "../utils/bot.utils";

function helpText() {
  return codeBlock(
    [
      "Доступні команди:",
      "/zones — список зон",
      "/zone <domain> — деталі зони + NS",
      "/dns_list <domain> [type] — записи DNS (A/AAAA/CNAME/TXT/MX)",
      "/dns_add <domain> <type> <name> <content> ttl proxied",
      "/dns_update <domain> <recordId> [name=...] [content=...] [ttl=...] [proxied=true|false] [type=...] [priority=...]",
      "/dns_del <domain> <recordId>",
      "",
      "Приклади:",
      "/zone alex.com",
      "/dns_list alex.com A",
      "/dns_add alex.com A api 93.184.216.34 1 true",
      "/dns_update alex.com 948ce70d... content=93.184.216.35 ttl=120 proxied=false",
      "/dns_del alex.com 1ccf708cb4...",
    ].join("\n")
  );
}

async function zonesSummary(): Promise<string> {
  const zones = await CloudflareService.listZones({});
  if (!zones.length) return "Зон поки немає.";
  const lines = zones.map((z) => `• ${z.name} — ${z.status}`);
  return lines.join("\n");
}

export function registerMetaCommands(bot: Telegraf) {
bot.telegram
  .setMyCommands([
    { command: "zones", description: "Список зон" },
    { command: "zone", description: "Деталі зони + NS (/zone alex.com)" },
    { command: "dns_list", description: "DNS записи (/dns_list alex.com A)" },
    { command: "dns_add", description: "Створити DNS запис (/help)" },
    { command: "dns_update", description: "Оновити DNS запис (/help)" }, // ⬅️ нове
    { command: "dns_del", description: "Видалити DNS запис (/help)" },
    { command: "help", description: "Довідка та приклади" },
    { command: "commands", description: "Перелік команд" },
  ])
  .catch(() => {});

  bot.start(async (ctx) => {
    try {
      const summary = await zonesSummary();
      const msg = [
        "Привіт! Я допоможу керувати Cloudflare зонами та DNS.",
        "",
        "*Що далі?*",
        "• Переглянь зони: /zones",
        "• Довідка й приклади: /help",
        "",
        "*Твої зони:*",
        summary,
      ].join("\n");
      await ctx.reply(msg, { parse_mode: "Markdown" as any });
    } catch (e: any) {
      await ctx.reply("Вітаю! Напишіть /help для довідки.");
    }
  });


  bot.command("help", async (ctx) => {
    await ctx.reply(helpText(), { parse_mode: "Markdown" as any });
  });

  
  bot.command("commands", async (ctx) => {
    await ctx.reply(helpText(), { parse_mode: "Markdown" as any });
  });

  bot.on("text", async (ctx, next) => {
    const text = ctx.message?.text || "";
    if (text.startsWith("/")) {
      const known = [
        "/zones",
        "/zone",
        "/dns_list",
        "/dns_add",
        "/dns_del",
        "/help",
        "/commands",
        "/dns_update",
      ];
      const cmd = text.split(/\s+/, 1)[0];
      if (!known.includes(cmd)) {
        await ctx.reply("Невідома команда. Спробуйте /help.", {
          parse_mode: "Markdown" as any,
        });
        return;
      }
    }
    return next();
  });
}
