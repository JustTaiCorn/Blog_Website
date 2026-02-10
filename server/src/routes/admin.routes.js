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
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protectedRoute);
router.use(checkRole(["ADMIN"]));

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

export default router;
