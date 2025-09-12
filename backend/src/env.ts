import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development"),
  PORT: Joi.number().integer().min(1).max(65535).default(4000),
  MONGODB_URI: Joi.string()
    .uri()
    .required()
    .messages({ "any.required": "MONGODB_URI is required" }),
  JWT_SECRET: Joi.string().min(8).required(),
  ACCESS_JWT_EXPIRES_IN: Joi.string()
    .pattern(/^\d+(ms|s|m|h|d)$/)
    .default("15m"),
  REFRESH_JWT_EXPIRES_IN: Joi.string()
    .pattern(/^\d+(ms|s|m|h|d)$/)
    .default("7d"),

  CORS_ALLOWED_ORIGINS: Joi.string().required(),
  COOKIE_NAME: Joi.string().default("refreshToken"),
  COOKIE_DOMAIN: Joi.string().default("localhost"),
  COOKIE_SECURE: Joi.boolean().default(false),
  COOKIE_SAMESITE: Joi.string().valid("lax", "strict", "none").default("lax"),

  ADMIN_EMAIL: Joi.string().email().optional(),
  ADMIN_PASSWORD: Joi.string().optional(),

  CF_API_TOKEN: Joi.string().required(),
  CF_ACCOUNT_ID: Joi.string()
    .pattern(/^[a-f0-9]{32}$/i)
    .required(),
  CF_API_BASE: Joi.string()
    .uri()
    .default("https://api.cloudflare.com/client/v4"),

  TELEGRAM_BOT_TOKEN: Joi.string(),
  TELEGRAM_CHAT_ID: Joi.number(),
  BOT_USE_POLLING: Joi.boolean().default(false),
  PUBLIC_URL: Joi.string().uri(),
  WEBHOOK_SECRET: Joi.string(),
});

const { value, error } = envSchema.validate(process.env, {
  abortEarly: false,
  allowUnknown: true,
});

if (error) {
  console.error(
    "❌ Invalid environment variables:\n",
    error.details.map((d) => d.message).join("\n")
  );
  process.exit(1);
}

type MsString =
  | `${number}ms`
  | `${number}s`
  | `${number}m`
  | `${number}h`
  | `${number}d`;
type ExpiresIn = number | MsString;

export const env = {
  NODE_ENV: value.NODE_ENV as string,
  PORT: Number(value.PORT),
  MONGODB_URI: value.MONGODB_URI as string,
  JWT_SECRET: value.JWT_SECRET as string,
  ACCESS_JWT_EXPIRES_IN: value.ACCESS_JWT_EXPIRES_IN as ExpiresIn,
  REFRESH_JWT_EXPIRES_IN: value.REFRESH_JWT_EXPIRES_IN as ExpiresIn,

  CORS_ALLOWED_ORIGINS: (value.CORS_ALLOWED_ORIGINS as string)
    .split(",")
    .map((s) => s.trim()),
  COOKIE_NAME: value.COOKIE_NAME as string,
  COOKIE_DOMAIN: value.COOKIE_DOMAIN as string,
  COOKIE_SECURE: Boolean(value.COOKIE_SECURE),
  COOKIE_SAMESITE: value.COOKIE_SAMESITE as "lax" | "strict" | "none",

  ADMIN_EMAIL: value.ADMIN_EMAIL as string | undefined,
  ADMIN_PASSWORD: value.ADMIN_PASSWORD as string | undefined,

  TELEGRAM_BOT_TOKEN: value.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: value.TELEGRAM_CHAT_ID,
  BOT_USE_POLLING: value.BOT_USE_POLLING,
  PUBLIC_URL: value.PUBLIC_URL,
  WEBHOOK_SECRET: value.WEBHOOK_SECRET,

  CF_API_TOKEN: value.CF_API_TOKEN as string,
  CF_ACCOUNT_ID: value.CF_ACCOUNT_ID as string,
  CF_API_BASE: value.CF_API_BASE as string,
};
