import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import {
  toggleFollow,
  getFollowStatus,
  getFollowCounts,
} from "../controllers/follow.controller.js";

const router = express.Router();

router.post("/:username", protectedRoute, toggleFollow);
router.get("/:username/status", protectedRoute, getFollowStatus);
router.get("/:username/counts", getFollowCounts);

export default router;
