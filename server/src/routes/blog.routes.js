import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import * as blogController from "../controllers/blog.controller.js";

const router = express.Router();

// Public routes
router.get("/:blog_id", blogController.getBlog);

// Protected routes
router.post("/create", protectedRoute, blogController.createBlog);
router.post(
  "/upload-banner",
  protectedRoute,
  upload.single("banner"),
  blogController.uploadBanner,
);
router.put("/update/:blog_id", protectedRoute, blogController.updateBlog);

export default router;
