import type { Request } from "express";

export function getClientIp(req: Request): string {
	const xfwd = req.headers["x-forwarded-for"];
	const firstFromXfwd = Array.isArray(xfwd) ? xfwd[0] : (xfwd || '').split(',')[0]?.trim()

	return (
    (req.headers["cf-connecting-ip"] as string) ||
    (req.headers["x-real-ip"] as string) ||
    firstFromXfwd ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

export function formatHookMessage(req: Request, bodyPreview?: string) {
	const ip = getClientIp(req)
	const ua = (req.headers["user-agent"] as string) || "-";
	const url = req.originalUrl || req.url;
	const method = req.method
	const ts = new Date().toISOString()

	const lines = [
    `🔔 *Incoming ${method}* ${url}`,
    `IP: \`${ip}\``,
    `UA: \`${escapeMd(ua)}\``,
    `Time: ${ts}`,
	];
	
	if (bodyPreview && bodyPreview.length > 0) {
    lines.push(`Body: \`${escapeMd(bodyPreview)}\``);
  }

  return lines.join("\n");

}

function escapeMd(s: string) {
  return s.replace(/[`*_[\]()~>#+\-=|{}.!\\]/g, "\\$&");
}