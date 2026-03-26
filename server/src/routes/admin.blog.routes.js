import express from "express";
import {
  getAllBlogs,
  deleteBlog,
} from "../controllers/admin/blog.controller.js";

const router = express.Router();

router.get("/", getAllBlogs);
router.delete("/:id", deleteBlog);

export default router;
