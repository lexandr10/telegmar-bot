import { env } from "../../env";
import HttpError from "../../helpers/httpError";

type CfError = { code: number; message: string };
type CfEnvelope<T> = {
  success: boolean;
  errors: CfError[];
  messages: any[];
  result: T;
};

function buildUrl(path: string, query?: Record<string, any>) {
	const base = env.CF_API_BASE.replace(/\/+$/, "") + "/";
	const relPath = path.replace(/^\/+/, "");
  const url = new URL(relPath, base);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function cfRequest<T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  options?: { query?: Record<string, any>; body?: any }
): Promise<T> {
	const url = buildUrl(path, options?.query);

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  let data: CfEnvelope<T> | undefined;
  try {
    data = (await res.json()) as CfEnvelope<T>;
  } catch {
    throw HttpError(
      502,
      `Cloudflare response is not JSON (status ${res.status})`
    );
  }
  if (!res.ok || !data.success) {
    const msg =
      data.errors?.[0]?.message || `Cloudflare error (status ${res.status})`;
    const status = res.status >= 400 ? res.status : 502;
    throw HttpError(status, msg);
	}
	return data.result;
}
