import { Router } from "express";
import { utils } from "../utils";
import {
  createPost,
  updatePost,
  publishPost,
  hideComment,
} from "../controllers/post.controller";
import { authCheck } from "../middleware/authCheck";

const router = Router();

router.post("/create", authCheck, utils.tryCatchBlock(createPost));
router.patch("/update/:id", authCheck, utils.tryCatchBlock(updatePost));
router.patch("/publish/:id", authCheck, utils.tryCatchBlock(publishPost));
router.patch("/hide/:id", authCheck, utils.tryCatchBlock(hideComment));

export default router;
