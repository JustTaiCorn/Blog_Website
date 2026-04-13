import { prisma } from "../lib/prisma.js";
import CustomError from "../config/Custom-error.js";

export const getNotifications = async (userId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 15;
  const skip = (page - 1) * limit;
  const type = query.type; // "like" | "comment" | "reply" | undefined

  const where = {
    notification_for: userId,
    ...(type ? { type } : {}),
  };

  const [notifications, total, unread_count] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            fullname: true,
            profile_img: true,
          },
        },
        blog: {
          select: {
            blog_id: true,
            title: true,
            slug: true,
          },
        },
        comment: {
          select: {
            id: true,
            comment: true,
          },
        },
        reply: {
          select: {
            id: true,
            comment: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { notification_for: userId, seen: false },
    }),
  ]);

  return {
    notifications,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    unread_count,
  };
};

export const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({
    where: { notification_for: userId, seen: false },
  });
  return { unread_count: count };
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: parseInt(notificationId) },
  });

  if (!notification) {
    throw new CustomError(404, "Không tìm thấy thông báo");
  }

  if (notification.notification_for !== userId) {
    throw new CustomError(403, "Bạn không có quyền thực hiện hành động này");
  }

  await prisma.notification.update({
    where: { id: notification.id },
    data: { seen: true },
  });

  return { message: "Đã đánh dấu đã đọc" };
};

export const markAllAsRead = async (userId, type) => {
  const where = {
    notification_for: userId,
    seen: false,
    ...(type ? { type } : {}),
  };

  await prisma.notification.updateMany({
    where,
    data: { seen: true },
  });

  return { message: "Đã đánh dấu tất cả đã đọc" };
};
