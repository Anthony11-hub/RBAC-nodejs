import { Router } from "express";
import { utils } from "../utils";
import {
  createPost,
  updatePost,
  publishPost,
  hideComment,
  getPost,
  listPosts,
  deletePost,
} from "../controllers/post.controller";
import { authCheck } from "../middleware/authCheck";
import { abilityMiddleware } from "../middleware/ability.middleware";

const router = Router();

// CREATE
router.post("/", authCheck, abilityMiddleware, utils.tryCatchBlock(createPost));
// READ
router.get("/", authCheck, abilityMiddleware, utils.tryCatchBlock(listPosts));
router.get("/:id", authCheck, abilityMiddleware, utils.tryCatchBlock(getPost));
// UPDATE
router.patch(
  "/:id",
  authCheck,
  abilityMiddleware,
  utils.tryCatchBlock(updatePost),
);
router.patch(
  "/:id/publish",
  authCheck,
  abilityMiddleware,
  utils.tryCatchBlock(publishPost),
);
// DELETE
router.delete(
  "/:id",
  authCheck,
  abilityMiddleware,
  utils.tryCatchBlock(deletePost),
);
// comments - UPDATE
router.patch(
  "/comments/:id/hide",
  authCheck,
  abilityMiddleware,
  utils.tryCatchBlock(hideComment),
);

export default router;
