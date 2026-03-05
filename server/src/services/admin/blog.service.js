import { prisma } from "../../lib/prisma.js";
import { deleteCache, deleteCacheByPattern } from "../../lib/redis.js";

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
    const error = new Error("Không tìm thấy blog");
    error.statusCode = 404;
    throw error;
  }

  await prisma.blog.delete({
    where: { id: parseInt(id) },
  });

  // Invalidate caches
  await deleteCache(`blogs:detail:${blog.blog_id}`);
  await deleteCacheByPattern("blogs:list:*");
};
