import express from "express";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/admin/user.controller.js";

const router = express.Router();

router.get("/", getAllUsers);
router.put("/role", updateUserRole);
router.delete("/:id", deleteUser);

export default router;
