import { prisma } from "../lib/prisma.js";
import { generateSlug } from "../utils/utils.js";
import { deleteCache, deleteCacheByPattern } from "../lib/redis.js";

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
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    if (category._count.blogs > 0) {
      return res.status(400).json({
        message: `Không thể xóa danh mục này vì đang có ${category._count.blogs} bài viết sử dụng`,
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });
    return res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

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

    // Check if tag has blogs
    const tag = await prisma.tag.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { blogs: true },
        },
      },
    });

    if (!tag) {
      return res.status(404).json({ message: "Không tìm thấy tag" });
    }

    if (tag._count.blogs > 0) {
      return res.status(400).json({
        message: `Không thể xóa tag này vì đang có ${tag._count.blogs} bài viết sử dụng`,
      });
    }

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

// --- Dashboard Stats ---

export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalBlogs, totalComments, totalLikes] =
      await Promise.all([
        prisma.user.count({ where: { deleted: false } }),
        prisma.blog.count({ where: { published: true } }),
        prisma.comment.count({ where: { active: true } }),
        prisma.blogLike.count(),
      ]);

    return res
      .status(200)
      .json({ totalUsers, totalBlogs, totalComments, totalLikes });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// --- Chart Data ---

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export const getNewUsersLast7Days = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const users = await prisma.user.findMany({
      where: {
        created_at: { gte: sevenDaysAgo },
        deleted: false,
      },
      select: { created_at: true },
    });

    // Build a map keyed by date string
    const countMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      countMap[key] = { day: DAY_LABELS[d.getDay()], count: 0 };
    }

    users.forEach((u) => {
      const key = u.created_at.toISOString().slice(0, 10);
      if (countMap[key]) countMap[key].count++;
    });

    return res.status(200).json(Object.values(countMap));
  } catch (error) {
    console.error("Lỗi khi lấy thống kê người dùng mới:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

const CHART_FILLS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export const getBlogsByCategory = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            blogs: { where: { published: true } },
          },
        },
      },
    });

    const data = categories
      .map((cat, i) => ({
        category: cat.name,
        count: cat._count.blogs,
        fill: CHART_FILLS[i % CHART_FILLS.length],
      }))
      .filter((item) => item.count > 0);

    return res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi khi lấy thống kê bài viết theo danh mục:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
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

    return res
      .status(200)
      .json({ comments, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Lỗi khi lấy bình luận:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const adminDeleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
      include: { replies: true },
    });

    if (!comment) {
      return res.status(404).json({ message: "Không tìm thấy bình luận" });
    }

    await prisma.$transaction(async (tx) => {
      // Delete replies first
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

    return res.status(200).json({ message: "Đã xóa bình luận" });
  } catch (error) {
    console.error("Lỗi khi xóa bình luận:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
