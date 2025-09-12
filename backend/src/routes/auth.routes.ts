import { Router } from "express";

import { loginSchema} from "../schemas/auth.schemas";
import emptyMiddleware from "../middlewares/emptyMiddleware";
import validateBody from "../decorators/validateBody";
import { loginController, logoutController, meController, refreshController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authenticate";

export const authRouter = Router();

authRouter.post('/login', emptyMiddleware, validateBody(loginSchema), loginController)
authRouter.post("/refresh", refreshController);
authRouter.get("/me", authenticate, meController)
authRouter.post("/logout", authenticate, logoutController)