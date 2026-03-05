import { prisma } from "../../lib/prisma.js";

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
    const error = new Error("Role không hợp lệ");
    error.statusCode = 400;
    throw error;
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
      const error = new Error("Không thể xóa quyền USER");
      error.statusCode = 400;
      throw error;
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
