import mongoose from "mongoose";

import { env } from "../env";
import { logger } from "../utils/logger";

export async function connectMongo(): Promise<void> {
  try {
		mongoose.set("strictQuery", true);
		await mongoose.connect(env.MONGODB_URI)
		logger.info("✅ MongoDB connected");
	} catch (error) {
		logger.error({ error }, "❌ MongoDB connection error");
    process.exit(1);
	}
}


export async function disconnectMongo(): Promise<void> {
	await mongoose.disconnect()
	logger.info("👋 MongoDB disconnected");
	
}