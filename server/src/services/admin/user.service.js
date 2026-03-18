import { prisma } from "../../lib/prisma.js";
import CustomError from "../../config/Custom-error.js";

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      fullname: true,
      profile_img: true,
      created_at: true,
      roles: {
        select: {
          role: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

export const updateUserRole = async (userId, role, action) => {
  if (!["ADMIN", "USER"].includes(role)) {
    throw new CustomError(400, "Role không hợp lệ");
  }

  if (action === "add") {
    await prisma.userRoleEntry.upsert({
      where: {
        user_id_role: {
          user_id: parseInt(userId),
          role: role,
        },
      },
      update: {},
      create: {
        user_id: parseInt(userId),
        role: role,
      },
    });
  } else {
    if (role === "USER") {
      throw new CustomError(400, "Không thể xóa quyền USER");
    }
    await prisma.userRoleEntry.delete({
      where: {
        user_id_role: {
          user_id: parseInt(userId),
          role: role,
        },
      },
    });
  }
};

export const deleteUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    include: {
      roles: true,
    },
  });

  if (!user) {
    throw new CustomError(404, "Không tìm thấy người dùng");
  }

  const isOwner = user.roles.some((r) => r.role === "OWNER");
  if (isOwner) {
    throw new CustomError(403, "Không thể xóa tài khoản OWNER");
  }

  await prisma.user.delete({
    where: { id: parseInt(userId) },
  });
};
