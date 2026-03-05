import express from "express";
import { protectedRoute, checkRole } from "../../middleware/auth.middleware.js";
import userRoutes from "./user.routes.js";
import categoryRoutes from "./category.routes.js";
import tagRoutes from "./tag.routes.js";
import blogRoutes from "./blog.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import commentRoutes from "./comment.routes.js";

const router = express.Router();
router.use(protectedRoute);
router.use(checkRole(["ADMIN"]));

router.use("/stats", dashboardRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/tags", tagRoutes);
router.use("/blogs", blogRoutes);
router.use("/comments", commentRoutes);

export default router;
