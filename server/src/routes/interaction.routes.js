import express from "express";
import { protectedRoute, optionalAuth } from "../middleware/auth.middleware.js";
import {
  getLikeStatus,
  toggleLike,
  getComments,
  addComment,
  addReply,
  deleteComment,
  getCommentLikeStatus,
  toggleCommentLike,
} from "../controllers/interaction.controller.js";

const router = express.Router({ mergeParams: true });

// Likes
router.get("/like", optionalAuth, getLikeStatus);
router.post("/like", protectedRoute, toggleLike);

// Comments
router.get("/comments", optionalAuth, getComments);
router.post("/comments", protectedRoute, addComment);
router.post("/comments/:comment_id/replies", protectedRoute, addReply);
router.delete("/comments/:comment_id", protectedRoute, deleteComment);

// Comment Likes
router.get("/comments/:comment_id/like", optionalAuth, getCommentLikeStatus);
router.post("/comments/:comment_id/like", protectedRoute, toggleCommentLike);

export default router;
