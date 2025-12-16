import { Router } from "express";
import { utils } from "../utils";
import {
  loginController,
  registerController,
} from "../controllers/auth.controller";

const router = Router();

router.post("/login", utils.tryCatchBlock(loginController));
router.post("/register", utils.tryCatchBlock(registerController));

export default router;
