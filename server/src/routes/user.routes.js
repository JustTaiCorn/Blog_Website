import express from "express";
import {
  authMe,
  updateProfile,
  getSocialLinks,
  updateSocialLinks,
} from "../controllers/user.controller.js";
import { uploadAvatar } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/me", authMe);
router.patch("/profile", uploadAvatar.single("avatar"), updateProfile);
router.get("/social-links", getSocialLinks);
router.put("/social-links", updateSocialLinks);

export default router;
