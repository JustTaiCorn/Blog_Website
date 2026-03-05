import { prisma } from "../../lib/prisma.js";
import { generateSlug } from "../../utils/utils.js";
import CustomError from "../../config/Custom-error.js";

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
  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) },
    include: {
      _count: {
        select: { blogs: true },
      },
    },
  });

  if (!category) {
    throw new CustomError(404, "Không tìm thấy danh mục");
  }

  if (category._count.blogs > 0) {
    throw new CustomError(
      400,
      `Không thể xóa danh mục này vì đang có ${category._count.blogs} bài viết sử dụng`,
    );
  }

  await prisma.category.delete({
    where: { id: parseInt(id) },
  });
};
