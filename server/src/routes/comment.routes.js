import express from "express";
import {
  getAllComments,
  adminDeleteComment,
} from "../controllers/admin/comment.controller.js";

const router = express.Router();

router.get("/", getAllComments);
router.delete("/:id", adminDeleteComment);

export default router;
