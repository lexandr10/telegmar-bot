import { Router } from "express";
import { hookPublicGet, hookPublicPost } from "../controllers/hook.controller";

export const hookRouter = Router();

hookRouter.get("/public", hookPublicGet)
hookRouter.post("/public", hookPublicPost);
