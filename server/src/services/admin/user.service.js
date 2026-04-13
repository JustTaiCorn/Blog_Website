import { prisma } from "../../lib/prisma.js";
import CustomError from "../../config/Custom-error.js";

export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      fullname: true,
      profile_img: true,
      created_at: true,
      roles: {
        select: {
          role: { select: { name: true } },
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return users.map((user) => ({
    ...user,
    roles: user.roles.map((ur) => ({ role: ur.role.name })),
  }));
};

export const updateUserRole = async (userId, role, action) => {
  if (!["ADMIN", "USER"].includes(role)) {
    throw new CustomError(400, "Role không hợp lệ");
  }

  const roleRecord = await prisma.role.findUnique({ where: { name: role } });
  if (!roleRecord) {
    throw new CustomError(400, "Role không tồn tại trong hệ thống");
  }

  const uid = parseInt(userId);

  if (action === "add") {
    await prisma.userRole.upsert({
      where: {
        user_id_role_id: {
          user_id: uid,
          role_id: roleRecord.id,
        },
      },
      update: {},
      create: {
        user_id: uid,
        role_id: roleRecord.id,
      },
    });
  } else {
    if (role === "USER") {
      throw new CustomError(400, "Không thể xóa quyền USER");
    }
    await prisma.userRole.delete({
      where: {
        user_id_role_id: {
          user_id: uid,
          role_id: roleRecord.id,
        },
      },
    });
  }
};

export const deleteUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    include: {
      roles: { include: { role: true } },
    },
  });

  if (!user) {
    throw new CustomError(404, "Không tìm thấy người dùng");
  }

  const isOwner = user.roles.some((r) => r.role.name === "OWNER");
  if (isOwner) {
    throw new CustomError(403, "Không thể xóa tài khoản OWNER");
  }

  await prisma.user.delete({
    where: { id: parseInt(userId) },
  });
};
