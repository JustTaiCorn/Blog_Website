import { prisma } from "../lib/prisma.js";
import { deleteCache } from "../lib/redis.js";

// ─── LIKE ───────────────────────────────────────────────────────────────────

/**
 * GET /api/blogs/:blog_id/like
 * Public – returns total_likes + whether the authenticated user liked it.
 */
export const getLikeStatus = async (req, res) => {
  try {
    const { blog_id } = req.params;

    const blog = await prisma.blog.findUnique({
      where: { blog_id },
      select: { id: true, activity_total_likes: true },
    });

    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy blog" });
    }

    let liked = false;
    if (req.user) {
      const existing = await prisma.blogLike.findUnique({
        where: { user_id_blog_id: { user_id: req.user.id, blog_id: blog.id } },
      });
      liked = !!existing;
    }

    res.status(200).json({ liked, total_likes: blog.activity_total_likes });
  } catch (error) {
    console.error("Error in getLikeStatus:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

/**
 * POST /api/blogs/:blog_id/like
 * Protected – toggle like/unlike.
 */
export const toggleLike = async (req, res) => {
  try {
    const { blog_id } = req.params;
    const user_id = req.user.id;

    const blog = await prisma.blog.findUnique({
      where: { blog_id },
      select: { id: true, author_id: true, activity_total_likes: true },
    });

    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy blog" });
    }

    const existing = await prisma.blogLike.findUnique({
      where: { user_id_blog_id: { user_id, blog_id: blog.id } },
    });

    if (existing) {
      // Unlike
      await prisma.$transaction([
        prisma.blogLike.delete({
          where: { user_id_blog_id: { user_id, blog_id: blog.id } },
        }),
        prisma.blog.update({
          where: { id: blog.id },
          data: { activity_total_likes: { decrement: 1 } },
        }),
        // Remove notification if exists
        prisma.notification.deleteMany({
          where: {
            type: "like",
            blog_id: blog.id,
            user_id,
            notification_for: blog.author_id,
          },
        }),
      ]);

      await deleteCache(`blogs:detail:${blog_id}`);
      return res.status(200).json({ liked: false, message: "Đã bỏ thích" });
    } else {
      // Like
      await prisma.$transaction([
        prisma.blogLike.create({
          data: { user_id, blog_id: blog.id },
        }),
        prisma.blog.update({
          where: { id: blog.id },
          data: { activity_total_likes: { increment: 1 } },
        }),
        // Create notification (not for self-likes)
        ...(blog.author_id !== user_id
          ? [
              prisma.notification.create({
                data: {
                  type: "like",
                  blog_id: blog.id,
                  notification_for: blog.author_id,
                  user_id,
                },
              }),
            ]
          : []),
      ]);

      await deleteCache(`blogs:detail:${blog_id}`);
      return res.status(200).json({ liked: true, message: "Đã thích" });
    }
  } catch (error) {
    console.error("Error in toggleLike:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ─── COMMENTS ───────────────────────────────────────────────────────────────

/**
 * GET /api/blogs/:blog_id/comments
 * Public – paginated top-level comments with nested replies.
 */
export const getComments = async (req, res) => {
  try {
    const { blog_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blog = await prisma.blog.findUnique({
      where: { blog_id },
      select: { id: true },
    });

    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy blog" });
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

    const formatComment = (c, userId) => {
      const upvotes = c.likes.filter((l) => l.type === "UP").length;
      const downvotes = c.likes.filter((l) => l.type === "DOWN").length;
      const userLike = userId
        ? c.likes.find((l) => l.user_id === userId)
        : null;
      const { likes, ...rest } = c;
      return {
        ...rest,
        total_likes: upvotes,
        total_dislikes: downvotes,
        user_vote: userLike ? userLike.type : null,
        replies: (c.replies || []).map((r) => formatComment(r, userId)),
      };
    };

    const userId = req.user?.id ?? null;
    const comments = rawComments.map((c) => formatComment(c, userId));

    res.status(200).json({
      comments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getComments:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

/**
 * POST /api/blogs/:blog_id/comments
 * Protected – add a top-level comment.
 */
export const addComment = async (req, res) => {
  try {
    const { blog_id } = req.params;
    const { comment } = req.body;
    const user_id = req.user.id;

    if (!comment || comment.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Nội dung bình luận không được để trống" });
    }

    const blog = await prisma.blog.findUnique({
      where: { blog_id },
      select: { id: true, author_id: true },
    });

    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy blog" });
    }

    const newComment = await prisma.$transaction(async (tx) => {
      const created = await tx.comment.create({
        data: {
          blog_id: blog.id,
          blog_author_id: blog.author_id,
          comment: comment.trim(),
          commented_by: user_id,
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

      // Notify blog author (not for self-comments)
      if (blog.author_id !== user_id) {
        await tx.notification.create({
          data: {
            type: "comment",
            blog_id: blog.id,
            notification_for: blog.author_id,
            user_id,
            comment_id: created.id,
          },
        });
      }

      return created;
    });

    res.status(201).json({ comment: newComment });
  } catch (error) {
    console.error("Error in addComment:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

/**
 * POST /api/blogs/:blog_id/comments/:comment_id/replies
 * Protected – add a reply to a comment.
 */
export const addReply = async (req, res) => {
  try {
    const { blog_id, comment_id } = req.params;
    const { comment } = req.body;
    const user_id = req.user.id;

    if (!comment || comment.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Nội dung phản hồi không được để trống" });
    }

    const blog = await prisma.blog.findUnique({
      where: { blog_id },
      select: { id: true, author_id: true },
    });

    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy blog" });
    }

    const parentComment = await prisma.comment.findUnique({
      where: { id: parseInt(comment_id) },
    });

    if (!parentComment || parentComment.blog_id !== blog.id) {
      return res.status(404).json({ message: "Không tìm thấy bình luận gốc" });
    }

    const newReply = await prisma.$transaction(async (tx) => {
      const created = await tx.comment.create({
        data: {
          blog_id: blog.id,
          blog_author_id: blog.author_id,
          comment: comment.trim(),
          commented_by: user_id,
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

      // Notify the parent comment author
      if (parentComment.commented_by !== user_id) {
        await tx.notification.create({
          data: {
            type: "reply",
            blog_id: blog.id,
            notification_for: parentComment.commented_by,
            user_id,
            reply_id: created.id,
            replied_on_comment_id: parentComment.id,
          },
        });
      }

      return created;
    });

    res.status(201).json({ reply: newReply });
  } catch (error) {
    console.error("Error in addReply:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

/**
 * DELETE /api/blogs/:blog_id/comments/:comment_id
 * Protected – delete own comment (or admin).
 */
export const deleteComment = async (req, res) => {
  try {
    const { blog_id, comment_id } = req.params;
    const user_id = req.user.id;
    const isAdmin = req.user.roles?.some((r) => r.role === "ADMIN");

    const blog = await prisma.blog.findUnique({
      where: { blog_id },
      select: { id: true },
    });

    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy blog" });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(comment_id) },
      include: {
        replies: { where: { active: true } },
      },
    });

    if (!comment || comment.blog_id !== blog.id) {
      return res.status(404).json({ message: "Không tìm thấy bình luận" });
    }

    if (comment.commented_by !== user_id && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa bình luận này" });
    }

    // Count how many comments will be removed (comment itself + its active replies)
    const replyCount = comment.is_reply ? 0 : comment.replies.length;
    const totalToRemove = 1 + replyCount;

    await prisma.$transaction(async (tx) => {
      // Delete all replies first
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

      // Remove related notifications
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

    res.status(200).json({ message: "Đã xóa bình luận" });
  } catch (error) {
    console.error("Error in deleteComment:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ─── COMMENT LIKES ───────────────────────────────────────────────────────────

/**
 * GET /api/blogs/:blog_id/comments/:comment_id/like
 * Optional auth – returns total_likes, total_dislikes, user_vote
 */
export const getCommentLikeStatus = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const likes = await prisma.commentLike.findMany({
      where: { comment_id: parseInt(comment_id) },
      select: { user_id: true, type: true },
    });

    const total_likes = likes.filter((l) => l.type === "UP").length;
    const total_dislikes = likes.filter((l) => l.type === "DOWN").length;
    const userLike = req.user
      ? likes.find((l) => l.user_id === req.user.id)
      : null;

    res.status(200).json({
      total_likes,
      total_dislikes,
      user_vote: userLike ? userLike.type : null,
    });
  } catch (error) {
    console.error("Error in getCommentLikeStatus:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const toggleCommentLike = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { type = "UP" } = req.body;
    const user_id = req.user.id;
    const existing = await prisma.commentLike.findUnique({
      where: {
        user_id_comment_id: { user_id, comment_id: parseInt(comment_id) },
      },
    });

    if (existing) {
      if (existing.type === type) {
        // Same type → remove vote
        await prisma.commentLike.delete({
          where: {
            user_id_comment_id: { user_id, comment_id: parseInt(comment_id) },
          },
        });
        return res
          .status(200)
          .json({ user_vote: null, message: "Đã hủy vote" });
      } else {
        // Different type → switch vote
        await prisma.commentLike.update({
          where: {
            user_id_comment_id: { user_id, comment_id: parseInt(comment_id) },
          },
          data: { type },
        });
        return res
          .status(200)
          .json({ user_vote: type, message: "Đã đổi vote" });
      }
    } else {
      await prisma.commentLike.create({
        data: { user_id, comment_id: parseInt(comment_id), type },
      });
      return res.status(200).json({
        user_vote: type,
        message: type === "UP" ? "Đã thích" : "Đã không thích",
      });
    }
  } catch (error) {
    console.error("Error in toggleCommentLike:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
