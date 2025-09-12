import { Router } from "express";

import { authenticate } from "../middlewares/authenticate";
import { requireRoles } from "../middlewares/requireRoles";
import { Role } from "../auth/roles";
import {
  getZoneByNameController,
  getZoneController,
  listZonesController,
} from "../controllers/cloudflare.controller";
import { validateParams, validateQuery } from "../middlewares/validatePart";
import {
  createDnsBodySchema,
  getZoneByNameParamsSchema,
  getZoneParamsSchema,
  listDnsQuerySchema,
  patchDnsBodySchema,
  zoneIdParamsSchema,
  zoneIdRecordIdParamsSchema,
} from "../schemas/cloudflare.schemas";
import {
  createDnsRecordController,
  deleteDnsRecordController,
  listDnsRecordsController,
  updateDnsRecordController,
} from "../controllers/cloudflare.dns.controller";
import validateBody from "../decorators/validateBody";

export const cloudflareRouter = Router();

cloudflareRouter.use(authenticate, requireRoles([Role.ADMIN]));

cloudflareRouter.get("/zones", listZonesController);
cloudflareRouter.get(
  "/zones/:id",
  validateParams(getZoneParamsSchema),
  getZoneController
);
cloudflareRouter.get(
  "/zones/by-name/:name",
  validateParams(getZoneByNameParamsSchema),
  getZoneByNameController
);

cloudflareRouter.get(
  "/zones/:zoneId/dns-records",
  validateParams(zoneIdParamsSchema),
  validateQuery(listDnsQuerySchema),
  listDnsRecordsController
);
cloudflareRouter.post(
  "/zones/:zoneId/dns-records",
  validateParams(zoneIdParamsSchema),
  validateBody(createDnsBodySchema),
  createDnsRecordController
);

cloudflareRouter.patch(
  "/zones/:zoneId/dns-records/:recordId",
  validateParams(zoneIdRecordIdParamsSchema),
  validateBody(patchDnsBodySchema),
  updateDnsRecordController
);

cloudflareRouter.delete(
  "/zones/:zoneId/dns-records/:recordId",
  validateParams(zoneIdRecordIdParamsSchema),
  deleteDnsRecordController
);
