import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import blogRoutes from "./blog.routes.js";
import interactionRoutes from "./interaction.routes.js";
import adminRoutes from "./admin.routes.js";
import notificationRoutes from "./notification.routes.js";
import followRoutes from "./follow.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/follow", followRoutes);
router.use("/blogs/:blog_id", interactionRoutes);
router.use("/blogs", blogRoutes);
router.use("/notifications", protectedRoute, notificationRoutes);
router.use("/admin", adminRoutes);

export default router;
