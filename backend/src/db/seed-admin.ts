import { AdminUserModel } from "../models/AdminUser";
import { logger } from "../utils/logger";
import { env } from "../env";
import bcrypt from "bcrypt";

export async function ensureAdminSeed() {
  const email = env.ADMIN_EMAIL;
  const password = env.ADMIN_PASSWORD;

  if (!email || !password) {
    logger.warn("ADMIN_EMAIL/ADMIN_PASSWORD not set; skip admin seed");
    return;
  }

  const exists = await AdminUserModel.findOne({ email }).lean();
  if (exists) {
    logger.info("Admin user already exists; skip seed");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await AdminUserModel.create({ email, passwordHash, roles: ["admin"] });
  logger.info(`Seeded admin user: ${email}`);
}
