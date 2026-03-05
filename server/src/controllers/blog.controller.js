import { prisma } from "../lib/prisma.js";
import { nanoid } from "nanoid";
import { generateSlug } from "../utils/utils.js";
import {
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
} from "../lib/redis.js";
export const createBlog = async (req, res) => {
  try {
    const { title, content, banner, des, category_id, tags, draft } = req.body;
    const author_id = req.user.id;

    if (!draft) {
      if (!title || title.trim().length === 0) {
        return res.status(400).json({ message: "Tiêu đề không được để trống" });
      }
      if (!content) {
        return res
          .status(400)
          .json({ message: "Nội dung không được để trống" });
      }
    }

    const blog_id = nanoid(10);
    let baseSlug = generateSlug(title || "untitled");
    let slug = baseSlug;

    let existingBlog = await prisma.blog.findUnique({ where: { slug } });
    let counter = 1;
    while (existingBlog) {
      slug = `${baseSlug}-${counter}`;
      existingBlog = await prisma.blog.findUnique({ where: { slug } });
      counter++;
    }

    const blog = await prisma.blog.create({
      data: {
        blog_id,
        title: title || "Untitled Blog",
        slug,
        banner,
        des,
        content: content || {},
        author_id,
        category_id: category_id ? parseInt(category_id) : null,
        draft: draft ?? false,
        published: !draft,
        published_at: !draft ? new Date() : null,
      },
    });

    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        let tag = await prisma.tag.findUnique({ where: { name: tagName } });
        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              slug: generateSlug(tagName),
            },
          });
        }
        await prisma.blogTag.create({
          data: {
            blog_id: blog.id,
            tag_id: tag.id,
          },
        });
      }
    }
    await prisma.user.update({
      where: { id: author_id },
      data: { total_posts: { increment: 1 } },
    });

    res.status(201).json({
      message: draft
        ? "Đã lưu bản nháp thành công"
        : "Blog đã được đăng thành công",
      blog_id: blog.blog_id,
    });

    await deleteCacheByPattern("blogs:list:*");
  } catch (error) {
    console.error("Error in createBlog:", error);
    res.status(500).json({ message: "Lỗi khi tạo blog", error: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { blog_id } = req.params;
    const { title, content, banner, des, category_id, tags, draft } = req.body;
    const author_id = req.user.id;

    const blog = await prisma.blog.findUnique({
      where: { blog_id },
    });

    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy blog" });
    }

    if (blog.author_id !== author_id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chỉnh sửa blog này" });
    }

    const updatedData = {
      title: title || blog.title,
      banner: banner !== undefined ? banner : blog.banner,
      des: des !== undefined ? des : blog.des,
      content: content || blog.content,
      category_id: category_id ? parseInt(category_id) : blog.category_id,
      draft: draft ?? blog.draft,
      published: draft === undefined ? blog.published : !draft,
    };

    if (!blog.published && !draft) {
      updatedData.published_at = new Date();
    }

    const updatedBlog = await prisma.blog.update({
      where: { blog_id },
      data: updatedData,
    });

    // Update Tags
    if (tags && Array.isArray(tags)) {
      // 1. Delete existing BlogTags
      await prisma.blogTag.deleteMany({
        where: { blog_id: blog.id },
      });

      // 2. Add new BlogTags
      for (const tagName of tags) {
        let tag = await prisma.tag.findUnique({ where: { name: tagName } });
        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              slug: generateSlug(tagName),
            },
          });
        }
        await prisma.blogTag.create({
          data: {
            blog_id: blog.id,
            tag_id: tag.id,
          },
        });
      }
    }

    res.status(200).json({
      message: "Cập nhật blog thành công",
      blog_id: updatedBlog.blog_id,
    });

    // Invalidate blog caches
    await deleteCache(`blogs:detail:${blog_id}`);
    await deleteCacheByPattern("blogs:list:*");
  } catch (error) {
    console.error("Error in updateBlog:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật blog", error: error.message });
  }
};

// Upload Banner
export const uploadBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không có file nào được upload" });
    }

    res.status(200).json({
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (error) {
    console.error("Error in uploadBanner:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi upload ảnh", error: error.message });
  }
};

// Upload Image
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không có file nào được upload" });
    }

    res.status(200).json({
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (error) {
    console.error("Error in uploadImage:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi upload ảnh", error: error.message });
  }
};

// Get Single Blog
export const getBlog = async (req, res) => {
  try {
    const { blog_id } = req.params;
    const cacheKey = `blogs:detail:${blog_id}`;

    // Check cache
    const cachedBlog = await getCache(cacheKey);
    if (cachedBlog) {
      return res.status(200).json({ blog: cachedBlog, fromCache: true });
    }

    const blog = await prisma.blog.findUnique({
      where: { blog_id },
      include: {
        author: {
          select: {
            fullname: true,
            username: true,
            profile_img: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy blog" });
    }

    const serializedBlog = {
      ...blog,
    };

    // Set cache
    await setCache(cacheKey, serializedBlog);

    res.status(200).json({ blog: serializedBlog });
  } catch (error) {
    console.error("Error in getBlog:", error);
    res.status(500).json({ message: "Lỗi khi lấy thông tin blog" });
  }
};

// Get All Blogs (Public)
export const getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "desc" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const orderDirection = sort === "asc" ? "asc" : "desc";
    const cacheKey = `blogs:list:page=${page}:limit=${limit}:sort=${sort}`;

    if (!req.user) {
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        return res.status(200).json({ ...cachedData, fromCache: true });
      }
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where: {
          draft: false,
          published: true,
        },
        include: {
          author: {
            select: {
              fullname: true,
              username: true,
              profile_img: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          published_at: orderDirection,
        },
        skip,
        take,
      }),
      prisma.blog.count({ where: { draft: false, published: true } }),
    ]);

    let serializedBlogs = blogs.map((blog) => ({ ...blog, liked: false }));

    const responseData = {
      blogs: serializedBlogs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / take),
    };

    // Cache kết quả cho anonymous users
    await setCache(cacheKey, responseData);

    // Nếu user đã đăng nhập, bổ sung trạng thái liked
    if (req.user) {
      const blogIds = blogs.map((b) => b.id);
      const userLikes = await prisma.blogLike.findMany({
        where: {
          user_id: req.user.id,
          blog_id: { in: blogIds },
        },
        select: { blog_id: true },
      });

      const likedSet = new Set(userLikes.map((l) => l.blog_id));
      responseData.blogs = serializedBlogs.map((blog) => ({
        ...blog,
        liked: likedSet.has(blog.id),
      }));
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in getAllBlogs:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách blog", error: error.message });
  }
};

// Get Categories
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
    res.status(200).json({ categories });
  } catch (error) {
    console.error("Error in getCategories:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh mục" });
  }
};

// Get Tags
export const getTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      select: {
        name: true,
      },
    });
    res.status(200).json({ tags: tags.map((t) => t.name) });
  } catch (error) {
    console.error("Error in getTags:", error);
    res.status(500).json({ message: "Lỗi khi lấy tags" });
  }
};

// Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const { blog_id } = req.params;
    const author_id = req.user.id;

    const blog = await prisma.blog.findUnique({
      where: { blog_id },
    });

    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy blog" });
    }

    if (blog.author_id !== author_id) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xoá blog này" });
    }

    await prisma.blog.delete({
      where: { blog_id },
    });

    // Decrement user total_posts
    await prisma.user.update({
      where: { id: author_id },
      data: { total_posts: { decrement: 1 } },
    });

    res.status(200).json({ message: "Xoá blog thành công" });

    // Invalidate caches
    await deleteCache(`blogs:detail:${blog_id}`);
    await deleteCacheByPattern("blogs:list:*");
  } catch (error) {
    console.error("Error in deleteBlog:", error);
    res.status(500).json({ message: "Lỗi khi xoá blog", error: error.message });
  }
};

// Get My Blogs (authenticated user's blogs)
export const getMyBlogs = async (req, res) => {
  try {
    const author_id = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where: { author_id },
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      prisma.blog.count({ where: { author_id } }),
    ]);

    res.status(200).json({
      blogs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error("Error in getMyBlogs:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách blog", error: error.message });
  }
};
