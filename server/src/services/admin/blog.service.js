import { prisma } from "../../lib/prisma.js";
import { deleteCache, deleteCacheByPattern } from "../../lib/redis.js";
import CustomError from "../../config/Custom-error.js";

export const getAllBlogs = async () => {
  return prisma.blog.findMany({
    include: {
      author: {
        select: { fullname: true, username: true },
      },
      category: true,
    },
    orderBy: { created_at: "desc" },
  });
};

export const deleteBlog = async (id) => {
  const blog = await prisma.blog.findUnique({
    where: { id: parseInt(id) },
  });

  if (!blog) {
    throw new CustomError(404, "Không tìm thấy blog");
  }

  await prisma.blog.delete({
    where: { id: parseInt(id) },
  });

  await deleteCache(`blogs:detail:${blog.blog_id}`);
  await deleteCacheByPattern("blogs:list:*");
};
