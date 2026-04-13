import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Không tìm thấy access token" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        console.error(err);
        return res
          .status(403)
          .json({ message: "Access token hết hạn hoặc không đúng" });
      }

      const user = await prisma.user.findUnique({
        where: {
          id: decoded.userId,
          deleted: false,
        },
        select: {
          id: true,
          username: true,
          email: true,
          fullname: true,
          profile_img: true,
          bio: true,
          total_posts: true,
          total_reads: true,
          created_at: true,
          roles: {
            select: {
              role: { select: { name: true } },
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại." });
      }

      req.user = {
        ...user,
        roles: user.roles.map((ur) => ({ role: ur.role.name })),
      };
      next();
    });
  } catch (error) {
    console.error("Lỗi khi xác minh JWT trong authMiddleware:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return next();
      }

      const user = await prisma.user.findUnique({
        where: {
          id: decoded.userId,
          deleted: false,
        },
        select: {
          id: true,
          username: true,
          email: true,
          fullname: true,
          profile_img: true,
          bio: true,
          total_posts: true,
          total_reads: true,
          created_at: true,
          roles: {
            select: {
              role: { select: { name: true } },
            },
          },
        },
      });

      if (user) {
        req.user = {
          ...user,
          roles: user.roles.map((ur) => ({ role: ur.role.name })),
        };
      }

      next();
    });
  } catch (error) {
    next();
  }
};
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Người dùng chưa đăng nhập" });
    }

    const userRoles = req.user.roles.map((r) => r.role);
    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện hành động này",
      });
    }

    next();
  };
};
