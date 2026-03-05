import express from "express";
import {
  googleAuth,
  refreshToken,
  signIn,
  signOut,
  signUp,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { loginLimiter } from "../middleware/rate-limit.middleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", loginLimiter, signIn);
router.post("/signout", signOut);
router.post("/refresh", refreshToken);
router.post("/google", googleAuth);
router.get("/verify-email/:token", verifyEmail);

export default router;
