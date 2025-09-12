import { UserModel } from "../models/User";
import { DomainModel } from "../models/Domain";
import { AuditLogModel } from "../models/AuditLog";
import { AdminUserModel } from "../models/AdminUser";
import { logger } from "../utils/logger";

export async function initModels() {
  await Promise.all([
    UserModel.init().then(() => logger.info("Indexes ensured: User")),
    DomainModel.init().then(() => logger.info("Indexes ensured: Domain")),
    AuditLogModel.init().then(() => logger.info("Indexes ensured: AuditLog")),
    AdminUserModel.init().then(() => logger.info("Indexes ensured: AdminUser")),
  ]);
}
