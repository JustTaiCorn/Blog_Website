import express from "express";
import { protectedRoute, optionalAuth } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import * as blogController from "../controllers/blog.controller.js";

const router = express.Router();

router.get("/", optionalAuth, blogController.getAllBlogs);
router.get("/categories/all", blogController.getCategories);
router.get("/tags/all", blogController.getTags);
router.get("/my-blogs", protectedRoute, blogController.getMyBlogs);
router.post("/create", protectedRoute, blogController.createBlog);
router.post(
  "/upload-banner",
  protectedRoute,
  upload.single("banner"),
  blogController.uploadBanner,
);
router.post(
  "/upload-image",
  protectedRoute,
  upload.single("image"),
  blogController.uploadImage,
);
router.put("/update/:blog_id", protectedRoute, blogController.updateBlog);
router.delete("/:blog_id", protectedRoute, blogController.deleteBlog);

router.get("/:blog_id", blogController.getBlog);

export default router;
