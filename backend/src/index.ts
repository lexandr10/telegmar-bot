import { env } from "./env";
import { connectMongo } from "./db/mongoose";
import { createApp } from "./app";
import { logger } from "./utils/logger";
import { initModels } from "./db/init-models";
import { ensureAdminSeed } from "./db/seed-admin";
import { bootstrapBot } from "./bot/bootstrap";

async function main() {
	await connectMongo();
	await initModels()
	await ensureAdminSeed()

	const app = createApp();
	  app.listen(env.PORT, () => {
      logger.info(
        `🚀 Server listening on http://localhost:${env.PORT} (env: ${env.NODE_ENV})`
      );
    });
	await bootstrapBot(app).catch((err) => {
		logger.error({ err }, "Bot bootstrap failed");
	});

}

main().catch((err) => {
  logger.error({ err }, "Fatal error on startup");
  process.exit(1);
});
