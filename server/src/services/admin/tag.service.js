import { prisma } from "../../lib/prisma.js";
import { generateSlug } from "../../utils/utils.js";
import CustomError from "../../config/Custom-error.js";

export const getAllTags = async () => {
  return prisma.tag.findMany({
    include: {
      _count: {
        select: { blogs: true },
      },
    },
    orderBy: { created_at: "desc" },
  });
};

export const createTag = async (name) => {
  const slug = generateSlug(name);

  return prisma.tag.create({
    data: { name, slug },
  });
};

export const updateTag = async (id, name) => {
  const slug = generateSlug(name);

  return prisma.tag.update({
    where: { id: parseInt(id) },
    data: { name, slug },
  });
};

export const deleteTag = async (id) => {
  const tag = await prisma.tag.findUnique({
    where: { id: parseInt(id) },
    include: {
      _count: {
        select: { blogs: true },
      },
    },
  });

  if (!tag) {
    throw new CustomError(404, "Không tìm thấy tag");
  }

  if (tag._count.blogs > 0) {
    throw new CustomError(
      400,
      `Không thể xóa tag này vì đang có ${tag._count.blogs} bài viết sử dụng`,
    );
  }

  await prisma.tag.delete({
    where: { id: parseInt(id) },
  });
};
