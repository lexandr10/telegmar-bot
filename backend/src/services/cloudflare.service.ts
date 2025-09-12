import { cfRequest } from "../integrations/cloudflare/cfClient";
import { env } from "../env";

export type CfZone = {
  id: string;
  name: string;
  status: string;
  name_servers?: string[];
  paused?: boolean;
  development_mode?: number;
};

export type CfDnsRecord = {
  id: string;
  type: "A" | "AAAA" | "CNAME" | "TXT" | "MX" | "NS" | "SRV" | "CAA" | "PTR";
  name: string;
  content: string;
  ttl: number;
  proxied?: boolean;
  priority?: number;
  zone_id: string;
  zone_name: string;
  created_on: string;
  modified_on: string;
};

export class CloudflareService {
  static async listZones(params?: {
    name?: string;
    page?: number;
    per_page?: number;
  }) {
    const { name, page = 1, per_page = 50 } = params || {};

    const result = await cfRequest<CfZone[]>("GET", "/zones", {
      query: {
        "account.id": env.CF_ACCOUNT_ID,
        name,
        page,
        per_page,
      },
    });
    return result;
  }

  static async getZone(zoneId: string) {
    return cfRequest<any>("GET", `/zones/${zoneId}`);
  }

  static async getZoneByName(name: string) {
    const result = await cfRequest<any[]>("GET", "/zones", { query: { name } });

    return result[0] || null;
  }

  static async listDnsRecords(
    zoneId: string,
    params: {
      type?: string;
      name?: string;
      page?: number;
      per_page?: number;
    }
  ) {
    const { type, name, page = 1, per_page = 100 } = params || {};
    return cfRequest<{ result: CfDnsRecord[] }["result"]>(
      "GET",
      `/zones/${zoneId}/dns_records`,
      { query: { type, name, page, per_page } }
    );
  }

  static async createDnsRecord(
    zoneId: string,
    payload: {
      type: "A" | "AAAA" | "CNAME" | "TXT" | "MX";
      name: string;
      content: string;
      ttl?: number;
      proxied?: boolean;
      priority?: number;
    }
  ) {
    const body: any = {
      type: payload.type,
      name: payload.name,
      content: payload.content,
      ttl: payload.ttl ?? 1,
    };
    if (payload.proxied !== undefined) body.proxied = payload.proxied;
    if (payload.priority !== undefined) body.priority = payload.priority;

    return cfRequest<CfDnsRecord>("POST", `/zones/${zoneId}/dns_records`, {
      body,
    });
  }

  static async updateDnsRecord(
    zoneId: string,
    recordId: string,
    patch: Partial<{
      type: "A" | "AAAA" | "CNAME" | "TXT" | "MX";
      name: string;
      content: string;
      ttl: number;
      proxied: boolean;
      priority: number;
    }>
  ) {
    return cfRequest<any>("PATCH", `/zones/${zoneId}/dns_records/${recordId}`, {
      body: patch,
    });
  }

  static async deleteDnsRecord(zoneId: string, recordId: string) {
    return cfRequest<any>("DELETE", `/zones/${zoneId}/dns_records/${recordId}`);
  }
}
