import { prisma } from "../../lib/prisma.js";
import CustomError from "../../config/Custom-error.js";

export const getAllComments = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      include: {
        commenter: {
          select: {
            id: true,
            fullname: true,
            username: true,
            profile_img: true,
          },
        },
        blog: {
          select: { blog_id: true, title: true },
        },
      },
      orderBy: { commented_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.comment.count(),
  ]);

  return { comments, total, page, totalPages: Math.ceil(total / limit) };
};

export const deleteComment = async (id) => {
  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(id) },
    include: { replies: true },
  });

  if (!comment) {
    throw new CustomError(404, "Không tìm thấy bình luận");
  }

  await prisma.$transaction(async (tx) => {
    if (!comment.is_reply && comment.replies.length > 0) {
      await tx.comment.deleteMany({ where: { parent_id: comment.id } });
    }
    await tx.comment.delete({ where: { id: comment.id } });

    const totalToRemove = 1 + (comment.is_reply ? 0 : comment.replies.length);
    await tx.blog.update({
      where: { id: comment.blog_id },
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
