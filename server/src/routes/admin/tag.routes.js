import express from "express";
import {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
} from "../../controllers/admin/tag.controller.js";

const router = express.Router();

router.get("/", getAllTags);
router.post("/", createTag);
router.put("/:id", updateTag);
router.delete("/:id", deleteTag);

export default router;
