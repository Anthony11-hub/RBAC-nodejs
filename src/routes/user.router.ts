import { Router } from "express";
import { utils } from "../utils";
import { authCheck } from "../middleware/authCheck";
import { abilityMiddleware } from "../middleware/ability.middleware";
import { deleteUser, updateUserRole } from "../controllers/admin.controller";

const router = Router();

router.patch(
  "/:id",
  authCheck,
  abilityMiddleware,
  utils.tryCatchBlock(updateUserRole),
);
router.delete(
  "/:id",
  authCheck,
  abilityMiddleware,
  utils.tryCatchBlock(deleteUser),
);

export default router;
