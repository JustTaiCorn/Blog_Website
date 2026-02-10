import { prisma } from "../lib/prisma.js";
import { generateSlug } from "../utils/utils.js";
import { deleteCache, deleteCacheByPattern } from "../lib/redis.js";

// --- User Management ---

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullname: true,
        profile_img: true,
        created_at: true,
        roles: {
          select: {
            role: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId, role, action } = req.body; // action: 'add' or 'remove'

    if (!["ADMIN", "USER"].includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }

    if (action === "add") {
      await prisma.userRoleEntry.upsert({
        where: {
          user_id_role: {
            user_id: parseInt(userId),
            role: role,
          },
        },
        update: {},
        create: {
          user_id: parseInt(userId),
          role: role,
        },
      });
    } else {
      // Prevent removing the last role? In this schema, roles are Entries.
      // Usually a user should have at least USER role.
      if (role === "USER") {
        return res.status(400).json({ message: "Không thể xóa quyền USER" });
      }
      await prisma.userRoleEntry.delete({
        where: {
          user_id_role: {
            user_id: parseInt(userId),
            role: role,
          },
        },
      });
    }

    return res.status(200).json({ message: "Cập nhật quyền thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật quyền người dùng:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// --- Category Management ---

export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { blogs: true },
        },
      },
      orderBy: { created_at: "desc" },
    });
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, details } = req.body;
    const slug = generateSlug(name);

    const category = await prisma.category.create({
      data: { name, slug, details },
    });

    return res.status(201).json(category);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Category đã tồn tại" });
    }
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, details } = req.body;
    const slug = generateSlug(name);

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, slug, details },
    });

    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({
      where: { id: parseInt(id) },
    });
    return res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// --- Tag Management ---

export const getAllTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { blogs: true },
        },
      },
      orderBy: { created_at: "desc" },
    });
    return res.status(200).json(tags);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    const slug = generateSlug(name);

    const tag = await prisma.tag.create({
      data: { name, slug },
    });

    return res.status(201).json(tag);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Tag đã tồn tại" });
    }
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const slug = generateSlug(name);

    const tag = await prisma.tag.update({
      where: { id: parseInt(id) },
      data: { name, slug },
    });

    return res.status(200).json(tag);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tag.delete({
      where: { id: parseInt(id) },
    });
    return res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// --- Blog Management ---

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      include: {
        author: {
          select: { fullname: true, username: true },
        },
        category: true,
      },
      orderBy: { created_at: "desc" },
    });
    return res.status(200).json(blogs);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await prisma.blog.findUnique({
      where: { id: parseInt(id) },
    });

    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy blog" });
    }

    await prisma.blog.delete({
      where: { id: parseInt(id) },
    });

    // Invalidate caches
    await deleteCache(`blogs:detail:${blog.blog_id}`);
    await deleteCacheByPattern("blogs:list:*");

    return res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa blog:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
