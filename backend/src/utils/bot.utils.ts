import type { Context } from "telegraf";

import { CloudflareService } from "../services/cloudflare.service";

export function ensurePrivateOrAllowedGroup(ctx: Context): boolean {
	const chat = ctx.chat
	if (!chat) return false
	if (chat.type === 'private') return true
	
	return true
}

export function codeBlock(s: string) {
	return "```\n" + s.replace(/```/g, "ˋˋˋ") + "\n```";
}

export async function resolveZoneIdByNameOrThrow(name: string) {
  const z = await CloudflareService.getZoneByName(name);
  if (!z) throw new Error(`Zone not found for ${name}`);
  return z.id as string;
}