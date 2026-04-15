import { prisma } from "../lib/prisma.js";
import { emitToUser } from "../lib/socket.js";
import CustomError from "../config/Custom-error.js";

export const toggleFollow = async (currentUserId, targetUsername) => {
  const targetUser = await prisma.user.findFirst({
    where: { username: targetUsername, deleted: false },
    select: { id: true, username: true, fullname: true, profile_img: true },
  });

  if (!targetUser) {
    throw new CustomError(404, "Không tìm thấy người dùng");
  }

  if (targetUser.id === currentUserId) {
    throw new CustomError(400, "Bạn không thể tự theo dõi chính mình");
  }

  const existing = await prisma.follow.findUnique({
    where: {
      follower_id_following_id: {
        follower_id: currentUserId,
        following_id: targetUser.id,
      },
    },
  });

  if (existing) {
    // Unfollow
    await prisma.$transaction([
      prisma.follow.delete({
        where: {
          follower_id_following_id: {
            follower_id: currentUserId,
            following_id: targetUser.id,
          },
        },
      }),
      prisma.notification.deleteMany({
        where: {
          type: "follow",
          user_id: currentUserId,
          notification_for: targetUser.id,
        },
      }),
    ]);

    return { is_following: false, message: "Đã hủy theo dõi" };
  } else {
    // Follow
    await prisma.$transaction([
      prisma.follow.create({
        data: {
          follower_id: currentUserId,
          following_id: targetUser.id,
        },
      }),
      prisma.notification.create({
        data: {
          type: "follow",
          notification_for: targetUser.id,
          user_id: currentUserId,
        },
      }),
    ]);

    // Emit realtime notification
    const actor = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        username: true,
        fullname: true,
        profile_img: true,
      },
    });

    emitToUser(targetUser.id, "notification:new", {
      type: "follow",
      actor,
      created_at: new Date().toISOString(),
    });

    return { is_following: true, message: "Đã theo dõi" };
  }
};

export const getFollowStatus = async (currentUserId, targetUsername) => {
  const targetUser = await prisma.user.findFirst({
    where: { username: targetUsername, deleted: false },
    select: { id: true },
  });

  if (!targetUser) {
    throw new CustomError(404, "Không tìm thấy người dùng");
  }

  const existing = await prisma.follow.findUnique({
    where: {
      follower_id_following_id: {
        follower_id: currentUserId,
        following_id: targetUser.id,
      },
    },
  });

  return { is_following: !!existing };
};

export const getFollowCounts = async (username) => {
  const user = await prisma.user.findFirst({
    where: { username, deleted: false },
    select: { id: true },
  });

  if (!user) {
    throw new CustomError(404, "Không tìm thấy người dùng");
  }

  const [followers_count, following_count] = await Promise.all([
    prisma.follow.count({ where: { following_id: user.id } }),
    prisma.follow.count({ where: { follower_id: user.id } }),
  ]);

  return { followers_count, following_count };
};
