import { Telegraf } from "telegraf";
import { CloudflareService } from "../services/cloudflare.service";
import {
  ensurePrivateOrAllowedGroup,
  codeBlock,
  resolveZoneIdByNameOrThrow,
} from "../utils/bot.utils";

function parseKV(args: string[]) {
  const out: Record<string, string> = {};
  for (const a of args) {
    const m = a.match(/^([a-zA-Z_]+)=(.+)$/);
    if (m) out[m[1].toLowerCase()] = m[2];
  }
  return out;
}

export function registerCloudflareCommands(bot: Telegraf) {
  bot.command("zones", async (ctx) => {
    if (!ensurePrivateOrAllowedGroup(ctx)) return;
    try {
      const zones = await CloudflareService.listZones({});
      if (!zones.length) return ctx.reply("Зон немає.");

      const lines = zones.map((z) => `• ${z.name} — ${z.status}`);
      await ctx.reply(lines.join("\n"));
    } catch (err: any) {
      await ctx.reply(
        "Помилка при читанні зон: " + (err?.message || "unknown")
      );
    }
  });

  bot.command("zone", async (ctx) => {
    if (!ensurePrivateOrAllowedGroup(ctx)) return;
    const text = ctx.message?.text || "";
    const [, domain] = text.split(/\s+/, 2);
    if (!domain) return ctx.reply("Використання: /zone <domain>");

    try {
      const zone = await CloudflareService.getZoneByName(domain);
      if (!zone) return ctx.reply("Зону не знайдено");
      const ns = (zone.name_servers || []).join("\n");

      const info =
        `Domain: ${zone.name}\nStatus: ${zone.status}\n` +
        (ns ? `NS:\n${ns}` : "NS: (немає)");
      await ctx.reply(codeBlock(info), { parse_mode: "Markdown" as any });
    } catch (error: any) {
      await ctx.reply("Помилка: " + (error?.message || "unknown"));
    }
  });

  bot.command("dns_list", async (ctx) => {
    if (!ensurePrivateOrAllowedGroup(ctx)) return;
    const text = ctx.message?.text || "";
    const parts = text.trim().split(/\s+/);
    if (parts.length < 2)
      return ctx.reply("Використання: /dns_list <domain> [type]");
    const domain = parts[1];
    const type = parts[2];
    try {
      const zoneId = await resolveZoneIdByNameOrThrow(domain);
      const records = await CloudflareService.listDnsRecords(zoneId, { type });
      if (!records.length) return ctx.reply("Записів не знайдено.");

      const lines = records.map(
        (r) =>
          `${r.id}  ${r.type}  ${r.name}  ${r.content}  ttl=${r.ttl}${
            r.proxied !== undefined ? ` proxied=${r.proxied}` : ""
          }`
      );
      await ctx.reply(codeBlock(lines.join("\n")), {
        parse_mode: "Markdown" as any,
      });
    } catch (e: any) {
      await ctx.reply("Помилка: " + (e?.message || "unknown"));
    }
  });

  bot.command("dns_add", async (ctx) => {
    if (!ensurePrivateOrAllowedGroup(ctx)) return;
    const text = ctx.message?.text || "";
    const parts = text.trim().split(/\s+/);
    if (parts.length < 5) {
      return ctx.reply(
        "Використання: /dns_add <domain> <type> <name> <content> [ttl] [proxied]\n" +
          "Приклад: /dns_add alex.com A api 93.184.216.34 1 true"
      );
    }
    const [, domain, type, name, content, ttlStr, proxiedStr] = parts;
    const ttl = ttlStr ? Number(ttlStr) : 1;
    const proxied =
      typeof proxiedStr !== "undefined" ? proxiedStr === "true" : undefined;

    try {
      const zoneId = await resolveZoneIdByNameOrThrow(domain);
      const rec = await CloudflareService.createDnsRecord(zoneId, {
        type: type as any,
        name,
        content,
        ttl,
        proxied,
      });
      await ctx.reply(
        "✅ Створено:\n" +
          codeBlock(
            `${rec.id} ${rec.type} ${rec.name} ${rec.content} ttl=${rec.ttl}${
              rec.proxied !== undefined ? ` proxied=${rec.proxied}` : ""
            }`
          ),
        { parse_mode: "Markdown" as any }
      );
    } catch (e: any) {
      await ctx.reply("Помилка створення: " + (e?.message || "unknown"));
    }
  });

  bot.command("dns_del", async (ctx) => {
    if (!ensurePrivateOrAllowedGroup(ctx)) return;
    const text = ctx.message?.text || "";
    const parts = text.trim().split(/\s+/);
    if (parts.length < 3) {
      return ctx.reply("Використання: /dns_del <domain> <recordId>");
    }
    const [, domain, recordId] = parts;

    try {
      const zoneId = await resolveZoneIdByNameOrThrow(domain);
      await CloudflareService.deleteDnsRecord(zoneId, recordId);
      await ctx.reply("🗑️ Видалено: " + recordId);
    } catch (e: any) {
      await ctx.reply("Помилка видалення: " + (e?.message || "unknown"));
    }
  });

  bot.command("dns_update", async (ctx) => {
    if (!ensurePrivateOrAllowedGroup(ctx)) return;

    const text = ctx.message?.text || "";
    const parts = text.trim().split(/\s+/);

    if (parts.length < 3) {
      return ctx.reply(
        codeBlock(
          [
            "Використання:",
            "/dns_update <domain> <recordId> [name=...] [content=...] [ttl=1] [proxied=true|false] [type=A|AAAA|CNAME|TXT|MX] [priority=10]",
            "",
            "Приклади:",
            "/dns_update alex.com 948ce70d... content=93.184.216.35 ttl=120 proxied=false",
            "/dns_update alex.com 948ce70d... name=api type=A",
            "/dns_update alex.com 948ce70d... content=mx.mail.tld type=MX priority=5",
          ].join("\n")
        ),
        { parse_mode: "Markdown" as any }
      );
    }

    const [, domain, recordId, ...kvArgs] = parts;
    const kv = parseKV(kvArgs);

    const patch: any = {};
    if (kv.type) patch.type = kv.type as any;
    if (kv.name) patch.name = kv.name;
    if (kv.content) patch.content = kv.content;
    if (kv.ttl) {
      const ttl = Number(kv.ttl);
      if (!Number.isFinite(ttl) || ttl < 1) {
        return ctx.reply("ttl має бути додатним числом (1 = Auto).");
      }
      patch.ttl = ttl;
    }
    if (kv.proxied !== undefined) {
      patch.proxied = kv.proxied === "true";
    }
    if (kv.priority !== undefined) {
      const pr = Number(kv.priority);
      if (!Number.isFinite(pr) || pr < 0) {
        return ctx.reply("priority має бути невідʼємним числом.");
      }
      patch.priority = pr;
    }

    // має бути хоч одне поле для оновлення
    if (Object.keys(patch).length === 0) {
      return ctx.reply(
        "Немає полів для оновлення. Додай хоча б одне: name=..., content=..., ttl=..., proxied=..., type=..., priority=..."
      );
    }

    try {
      const zoneId = await resolveZoneIdByNameOrThrow(domain);
      const updated = await CloudflareService.updateDnsRecord(
        zoneId,
        recordId,
        patch
      );

      const summary =
        `${updated.id} ${updated.type} ${updated.name} ${updated.content} ttl=${updated.ttl}` +
        (updated.proxied !== undefined ? ` proxied=${updated.proxied}` : "") +
        (updated.priority !== undefined ? ` priority=${updated.priority}` : "");

      await ctx.reply("✅ Оновлено:\n" + codeBlock(summary), {
        parse_mode: "Markdown" as any,
      });
    } catch (e: any) {
      await ctx.reply("Помилка оновлення: " + (e?.message || "unknown"));
    }
  });
}
