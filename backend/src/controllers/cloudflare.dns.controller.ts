import { Request, Response } from "express";

import ctrlWrapper from "../decorators/ctrlWrapper";
import { CloudflareService } from "../services/cloudflare.service";

export const listDnsRecordsController = ctrlWrapper(
  async (req: Request, res: Response) => {
    const { zoneId } = req.params as { zoneId: string };
    const { type, name, page, per_page } = req.query as any;

    const items = await CloudflareService.listDnsRecords(zoneId, {
      type,
      name,
      page: page ? Number(page) : undefined,
      per_page: per_page ? Number(per_page) : undefined,
    });

    return res.json({ items });
  }
);

export const createDnsRecordController = ctrlWrapper(
  async (req: Request, res: Response) => {
    const { zoneId } = req.params as { zoneId: string };
    const { type, name, content, ttl, proxied, priority } = req.body;

    const record = await CloudflareService.createDnsRecord(zoneId, {
      type,
      name,
      content,
      ttl,
      proxied,
      priority,
    });

    res.status(201).json({ items: record });
  }
);

export const updateDnsRecordController = ctrlWrapper(
  async (req: Request, res: Response) => {
    const { zoneId, recordId } = req.params as {
      zoneId: string;
      recordId: string;
    };
    const { type, name, content, ttl, proxied, priority } = req.body;

    const updated = await CloudflareService.updateDnsRecord(zoneId, recordId, {
      type,
      name,
      content,
      ttl,
      proxied,
      priority,
    });

    res.json({ item: updated });
  }
);

export const deleteDnsRecordController = ctrlWrapper(
  async (req: Request, res: Response) => {
    const { zoneId, recordId } = req.params as {
      zoneId: string;
      recordId: string;
    };

    await CloudflareService.deleteDnsRecord(zoneId, recordId);

    res.status(204).send();
  }
);
