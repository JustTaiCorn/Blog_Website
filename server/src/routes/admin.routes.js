import express from "express";
import { protectedRoute, checkRole } from "../middleware/auth.middleware.js";
import {
  getAllUsers,
  updateUserRole,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  getAllBlogs,
  deleteBlog,
  getDashboardStats,
  getNewUsersLast7Days,
  getBlogsByCategory,
  getAllComments,
  adminDeleteComment,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protectedRoute);
router.use(checkRole(["ADMIN"]));

// Stats
router.get("/stats", getDashboardStats);
router.get("/stats/new-users-7days", getNewUsersLast7Days);
router.get("/stats/blogs-by-category", getBlogsByCategory);

// Users
router.get("/users", getAllUsers);
router.put("/users/role", updateUserRole);

// Categories
router.get("/categories", getAllCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// Tags
router.get("/tags", getAllTags);
router.post("/tags", createTag);
router.put("/tags/:id", updateTag);
router.delete("/tags/:id", deleteTag);

// Blogs
router.get("/blogs", getAllBlogs);
router.delete("/blogs/:id", deleteBlog);

// Comments
router.get("/comments", getAllComments);
router.delete("/comments/:id", adminDeleteComment);

export default router;
