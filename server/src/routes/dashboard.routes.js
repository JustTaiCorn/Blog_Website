import express from "express";
import {
  getDashboardStats,
  getNewUsersLast7Days,
  getBlogsByCategory,
} from "../controllers/admin/dashboard.controller.js";

const router = express.Router();

router.get("/", getDashboardStats);
router.get("/new-users-7days", getNewUsersLast7Days);
router.get("/blogs-by-category", getBlogsByCategory);

export default router;
