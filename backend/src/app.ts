import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./env";
import { authRouter } from "./routes/auth.routes";
import { usersRouter } from "./routes/users.routes";
import { hookRouter } from "./routes/hook.routes";
import { cloudflareRouter } from "./routes/cloudflare.routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || env.CORS_ALLOWED_ORIGINS.includes(origin))
          return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));

	app.use("/api/auth", authRouter);
	app.use("/api/users", usersRouter);
	app.use("/hook", hookRouter);
	app.use("/api/cf", cloudflareRouter);

  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, ts: Date.now() });
  });

app.use((err: any, req: Request, resp: Response, next: NextFunction) => {
  const { status = 500, message = "Problem with server" } = err;
  resp.status(status).json({ message });
});

  return app;
}
