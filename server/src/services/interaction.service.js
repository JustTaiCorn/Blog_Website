import { prisma } from "../lib/prisma.js";
import { deleteCache } from "../lib/redis.js";
import { emitToUser } from "../lib/socket.js";
import CustomError from "../config/Custom-error.js";

export const getLikeStatus = async (blogId, userId) => {
  const blog = await prisma.blog.findUnique({
    where: { blog_id: blogId },
    select: { id: true, activity_total_likes: true },
  });

  if (!blog) {
    throw new CustomError(404, "Không tìm thấy blog");
  }

  let liked = false;
  if (userId) {
    const existing = await prisma.blogLike.findUnique({
      where: { user_id_blog_id: { user_id: userId, blog_id: blog.id } },
    });
    liked = !!existing;
  }

  return { liked, total_likes: blog.activity_total_likes };
};

export const toggleLike = async (blogId, userId) => {
  const blog = await prisma.blog.findUnique({
    where: { blog_id: blogId },
    select: { id: true, author_id: true, activity_total_likes: true },
  });

  if (!blog) {
    throw new CustomError(404, "Không tìm thấy blog");
  }

  const existing = await prisma.blogLike.findUnique({
    where: { user_id_blog_id: { user_id: userId, blog_id: blog.id } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.blogLike.delete({
        where: { user_id_blog_id: { user_id: userId, blog_id: blog.id } },
      }),
      prisma.blog.update({
        where: { id: blog.id },
        data: { activity_total_likes: { decrement: 1 } },
      }),
      prisma.notification.deleteMany({
        where: {
          type: "like",
          blog_id: blog.id,
          user_id: userId,
          notification_for: blog.author_id,
        },
      }),
    ]);

    await deleteCache(`blogs:detail:${blogId}`);
    return { liked: false, message: "Đã bỏ thích" };
  } else {
    await prisma.$transaction([
      prisma.blogLike.create({
        data: { user_id: userId, blog_id: blog.id },
      }),
      prisma.blog.update({
        where: { id: blog.id },
        data: { activity_total_likes: { increment: 1 } },
      }),
      ...(blog.author_id !== userId
        ? [
            prisma.notification.create({
              data: {
                type: "like",
                blog_id: blog.id,
                notification_for: blog.author_id,
                user_id: userId,
              },
            }),
          ]
        : []),
    ]);

    if (blog.author_id !== userId) {
      const [actor, blogInfo] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            username: true,
            fullname: true,
            profile_img: true,
          },
        }),
        prisma.blog.findUnique({
          where: { id: blog.id },
          select: { blog_id: true, title: true, slug: true },
        }),
      ]);

      emitToUser(blog.author_id, "notification:new", {
        type: "like",
        actor,
        blog: blogInfo,
        created_at: new Date().toISOString(),
      });
    }

    await deleteCache(`blogs:detail:${blogId}`);
    return { liked: true, message: "Đã thích" };
  }
};

export const getComments = async (blogId, query, userId) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const blog = await prisma.blog.findUnique({
    where: { blog_id: blogId },
    select: { id: true },
  });

  if (!blog) {
    throw new CustomError(404, "Không tìm thấy blog");
  }

  const [rawComments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { blog_id: blog.id, is_reply: false, active: true },
      include: {
        commenter: {
          select: {
            id: true,
            fullname: true,
            username: true,
            profile_img: true,
          },
        },
        likes: { select: { user_id: true, type: true } },
        replies: {
          where: { active: true },
          include: {
            commenter: {
              select: {
                id: true,
                fullname: true,
                username: true,
                profile_img: true,
              },
            },
            likes: { select: { user_id: true, type: true } },
          },
          orderBy: { commented_at: "asc" },
        },
      },
      orderBy: { commented_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.comment.count({
      where: { blog_id: blog.id, is_reply: false, active: true },
    }),
  ]);

  const formatComment = (c, uid) => {
    const upvotes = c.likes.filter((l) => l.type === "UP").length;
    const downvotes = c.likes.filter((l) => l.type === "DOWN").length;
    const userLike = uid ? c.likes.find((l) => l.user_id === uid) : null;
    const { likes, ...rest } = c;
    return {
      ...rest,
      total_likes: upvotes,
      total_dislikes: downvotes,
      user_vote: userLike ? userLike.type : null,
      replies: (c.replies || []).map((r) => formatComment(r, uid)),
    };
  };

  const comments = rawComments.map((c) => formatComment(c, userId));

  return {
    comments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const addComment = async (blogId, commentText, userId) => {
  const blog = await prisma.blog.findUnique({
    where: { blog_id: blogId },
    select: { id: true, author_id: true },
  });

  if (!blog) {
    throw new CustomError(404, "Không tìm thấy blog");
  }

  const newComment = await prisma.$transaction(async (tx) => {
    const created = await tx.comment.create({
      data: {
        blog_id: blog.id,
        blog_author_id: blog.author_id,
        comment: commentText.trim(),
        commented_by: userId,
      },
      include: {
        commenter: {
          select: {
            id: true,
            fullname: true,
            username: true,
            profile_img: true,
          },
        },
        replies: true,
      },
    });

    await tx.blog.update({
      where: { id: blog.id },
      data: {
        activity_total_comments: { increment: 1 },
        activity_total_parent_comments: { increment: 1 },
      },
    });

    if (blog.author_id !== userId) {
      await tx.notification.create({
        data: {
          type: "comment",
          blog_id: blog.id,
          notification_for: blog.author_id,
          user_id: userId,
          comment_id: created.id,
        },
      });
    }

    return created;
  });

  if (blog.author_id !== userId) {
    const blogInfo = await prisma.blog.findUnique({
      where: { id: blog.id },
      select: { blog_id: true, title: true, slug: true },
    });

    emitToUser(blog.author_id, "notification:new", {
      type: "comment",
      actor: newComment.commenter,
      blog: blogInfo,
      comment: { id: newComment.id, comment: newComment.comment },
      created_at: new Date().toISOString(),
    });
  }

  return newComment;
};

export const addReply = async (blogId, commentId, replyText, userId) => {
  const blog = await prisma.blog.findUnique({
    where: { blog_id: blogId },
    select: { id: true, author_id: true },
  });

  if (!blog) {
    throw new CustomError(404, "Không tìm thấy blog");
  }

  const parentComment = await prisma.comment.findUnique({
    where: { id: parseInt(commentId) },
  });

  if (!parentComment || parentComment.blog_id !== blog.id) {
    throw new CustomError(404, "Không tìm thấy bình luận gốc");
  }

  const newReply = await prisma.$transaction(async (tx) => {
    const created = await tx.comment.create({
      data: {
        blog_id: blog.id,
        blog_author_id: blog.author_id,
        comment: replyText.trim(),
        commented_by: userId,
        parent_id: parentComment.id,
        is_reply: true,
      },
      include: {
        commenter: {
          select: {
            id: true,
            fullname: true,
            username: true,
            profile_img: true,
          },
        },
      },
    });

    await tx.blog.update({
      where: { id: blog.id },
      data: { activity_total_comments: { increment: 1 } },
    });

    if (parentComment.commented_by !== userId) {
      await tx.notification.create({
        data: {
          type: "reply",
          blog_id: blog.id,
          notification_for: parentComment.commented_by,
          user_id: userId,
          reply_id: created.id,
          replied_on_comment_id: parentComment.id,
        },
      });
    }

    return created;
  });
  if (parentComment.commented_by !== userId) {
    const blogInfo = await prisma.blog.findUnique({
      where: { id: blog.id },
      select: { blog_id: true, title: true, slug: true },
    });

    emitToUser(parentComment.commented_by, "notification:new", {
      type: "reply",
      actor: newReply.commenter,
      blog: blogInfo,
      reply: { id: newReply.id, comment: newReply.comment },
      created_at: new Date().toISOString(),
    });
  }

  return newReply;
};

export const deleteComment = async (blogId, commentId, userId, isAdmin) => {
  const blog = await prisma.blog.findUnique({
    where: { blog_id: blogId },
    select: { id: true },
  });

  if (!blog) {
    throw new CustomError(404, "Không tìm thấy blog");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(commentId) },
    include: {
      replies: { where: { active: true } },
    },
  });

  if (!comment || comment.blog_id !== blog.id) {
    throw new CustomError(404, "Không tìm thấy bình luận");
  }

  if (comment.commented_by !== userId && !isAdmin) {
    throw new CustomError(403, "Bạn không có quyền xóa bình luận này");
  }

  const replyCount = comment.is_reply ? 0 : comment.replies.length;
  const totalToRemove = 1 + replyCount;

  await prisma.$transaction(async (tx) => {
    if (!comment.is_reply && replyCount > 0) {
      await tx.comment.deleteMany({
        where: { parent_id: comment.id },
      });
    }
    await tx.comment.delete({ where: { id: comment.id } });

    await tx.blog.update({
      where: { id: blog.id },
      data: {
        activity_total_comments: { decrement: totalToRemove },
        ...(comment.is_reply
          ? {}
          : { activity_total_parent_comments: { decrement: 1 } }),
      },
    });

    await tx.notification.deleteMany({
      where: {
        OR: [
          { comment_id: comment.id },
          { reply_id: comment.id },
          { replied_on_comment_id: comment.id },
        ],
      },
    });
  });
};

export const toggleCommentLike = async (commentId, userId, type = "UP") => {
  const existing = await prisma.commentLike.findUnique({
    where: {
      user_id_comment_id: { user_id: userId, comment_id: parseInt(commentId) },
    },
  });

  if (existing) {
    if (existing.type === type) {
      await prisma.commentLike.delete({
        where: {
          user_id_comment_id: {
            user_id: userId,
            comment_id: parseInt(commentId),
          },
        },
      });
      return { user_vote: null, message: "Đã hủy vote" };
    } else {
      await prisma.commentLike.update({
        where: {
          user_id_comment_id: {
            user_id: userId,
            comment_id: parseInt(commentId),
          },
        },
        data: { type },
      });
      return { user_vote: type, message: "Đã đổi vote" };
    }
  } else {
    await prisma.commentLike.create({
      data: { user_id: userId, comment_id: parseInt(commentId), type },
    });
    return {
      user_vote: type,
      message: type === "UP" ? "Đã thích" : "Đã không thích",
    };
  }
};
