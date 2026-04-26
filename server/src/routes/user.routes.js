import express from "express";
import {
  authMe,
  updateProfile,
  getSocialLinks,
  updateSocialLinks,
  getPublicProfileCtrl,
} from "../controllers/user.controller.js";
import { uploadAvatar } from "../middleware/upload.middleware.js";
import {
  protectedRoute,
  optionalAuth,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Public
router.get("/profile/:username", optionalAuth, getPublicProfileCtrl);

// Protected
router.get("/me", protectedRoute, authMe);
router.patch(
  "/profile",
  protectedRoute,
  uploadAvatar.single("avatar"),
  updateProfile,
);
router.get("/social-links", protectedRoute, getSocialLinks);
router.put("/social-links", protectedRoute, updateSocialLinks);

export default router;
