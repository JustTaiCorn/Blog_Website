import { prisma } from "../../lib/prisma.js";
import { generateSlug } from "../../utils/utils.js";

export const getAllCategories = async () => {
  return prisma.category.findMany({
    include: {
      _count: {
        select: { blogs: true },
      },
    },
    orderBy: { created_at: "desc" },
  });
};

export const createCategory = async (name, details) => {
  const slug = generateSlug(name);

  return prisma.category.create({
    data: { name, slug, details },
  });
};

export const updateCategory = async (id, name, details) => {
  const slug = generateSlug(name);

  return prisma.category.update({
    where: { id: parseInt(id) },
    data: { name, slug, details },
  });
};

export const deleteCategory = async (id) => {
  // Check if category has blogs
  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) },
    include: {
      _count: {
        select: { blogs: true },
      },
    },
  });

  if (!category) {
    const error = new Error("Không tìm thấy danh mục");
    error.statusCode = 404;
    throw error;
  }

  if (category._count.blogs > 0) {
    const error = new Error(
      `Không thể xóa danh mục này vì đang có ${category._count.blogs} bài viết sử dụng`,
    );
    error.statusCode = 400;
    throw error;
  }

  await prisma.category.delete({
    where: { id: parseInt(id) },
  });
};
