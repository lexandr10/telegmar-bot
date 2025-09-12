import Joi from "joi";

export const getZoneParamsSchema = Joi.object({
  id: Joi.string().required(),
});

export const getZoneByNameParamsSchema = Joi.object({
  name: Joi.string().domain().required(),
});

export const listDnsQuerySchema = Joi.object({
  type: Joi.string().valid("A", "AAAA", "CNAME", "TXT", "MX").optional(),
  name: Joi.string().optional(), 
  page: Joi.number().integer().min(1).optional(),
  per_page: Joi.number().integer().min(1).max(5000).optional(),
});

export const createDnsBodySchema = Joi.object({
  type: Joi.string().valid("A", "AAAA", "CNAME", "TXT", "MX").required(),
  name: Joi.string().required(), 
  content: Joi.string().required(), 
  ttl: Joi.number().integer().min(1).optional(), 
  proxied: Joi.boolean().optional(), 
  priority: Joi.number().integer().min(0).optional(), 
});

export const zoneIdParamsSchema = Joi.object({
  zoneId: Joi.string().required(),
});

export const zoneIdRecordIdParamsSchema = Joi.object({
  zoneId: Joi.string().required(),
  recordId: Joi.string().required(),
});

export const patchDnsBodySchema = Joi.object({
  type: Joi.string().valid("A", "AAAA", "CNAME", "TXT", "MX"),
  name: Joi.string(),
  content: Joi.string(),
  ttl: Joi.number().integer().min(1),
  proxied: Joi.boolean(),
  priority: Joi.number().integer().min(0),
}).or("type", "name", "content", "ttl", "proxied", "priority");