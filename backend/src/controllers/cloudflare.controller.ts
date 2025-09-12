import { Request, Response } from "express";
import ctrlWrapper from "../decorators/ctrlWrapper";
import { CloudflareService } from "../services/cloudflare.service";
import HttpError from "../helpers/httpError";

export const listZonesController = ctrlWrapper(
  async (req: Request, res: Response) => {
    const { name, page, per_page } = req.query as any;
    const zones = await CloudflareService.listZones({
      name,
      page: page ? Number(page) : undefined,
      per_page: per_page ? Number(per_page) : undefined,
    });
    res.json({ items: zones });
  }
);

export const getZoneController = ctrlWrapper(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const zone = await CloudflareService.getZone(id);
    if (!zone) throw HttpError(404, "Zone not found");

    res.json({
      id: zone.id,
      name: zone.name,
      status: zone.status,
      name_servers: zone.name_servers || [],
      created_on: zone.created_on,
      modified_on: zone.modified_on,
    });
  }
);

export const getZoneByNameController = ctrlWrapper(async (req: Request, res: Response) => {
	const { name } = req.params
	const zone = await CloudflareService.getZoneByName(name)
	if (!zone) throw HttpError(404, "Zone not found")
	
	res.json({
    id: zone.id,
    name: zone.name,
    status: zone.status,
    name_servers: zone.name_servers || [],
  });
})
