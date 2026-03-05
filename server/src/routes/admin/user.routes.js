import express from "express";
import {
  getAllUsers,
  updateUserRole,
} from "../../controllers/admin/user.controller.js";

const router = express.Router();

router.get("/", getAllUsers);
router.put("/role", updateUserRole);

export default router;
