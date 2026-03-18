import { prisma } from "../lib/prisma.js";
import { nanoid } from "nanoid";
import { generateSlug } from "../utils/utils.js";
import { parseISO, startOfDay, endOfDay } from "date-fns";
import {
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
} from "../lib/redis.js";
import CustomError from "../config/Custom-error.js";

export const createBlog = async (data, authorId) => {
  const { title, content, banner, des, category_id, tags, draft } = data;

  if (!draft) {
    if (!title || title.trim().length === 0) {
      throw new CustomError(400, "Tiêu đề không được để trống");
    }
    if (!content) {
      throw new CustomError(400, "Nội dung không được để trống");
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
      author_id: authorId,
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
    where: { id: authorId },
    data: { total_posts: { increment: 1 } },
  });

  await deleteCacheByPattern("blogs:list:*");

  return { blog_id: blog.blog_id, draft };
};

export const updateBlog = async (blogId, data, authorId) => {
  const { title, content, banner, des, category_id, tags, draft } = data;

  const blog = await prisma.blog.findUnique({
    where: { blog_id: blogId },
  });

  if (!blog) {
    throw new CustomError(404, "Không tìm thấy blog");
  }

  if (blog.author_id !== authorId) {
    throw new CustomError(403, "Bạn không có quyền chỉnh sửa blog này");
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
    where: { blog_id: blogId },
    data: updatedData,
  });

  // Update Tags
  if (tags && Array.isArray(tags)) {
    await prisma.blogTag.deleteMany({
      where: { blog_id: blog.id },
    });

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

  // Invalidate blog caches
  await deleteCache(`blogs:detail:${blogId}`);
  await deleteCacheByPattern("blogs:list:*");

  return { blog_id: updatedBlog.blog_id };
};

export const getBlogById = async (blogId) => {
  const cacheKey = `blogs:detail:${blogId}`;

  const cachedBlog = await getCache(cacheKey);
  if (cachedBlog) {
    return { blog: cachedBlog, fromCache: true };
  }

  const blog = await prisma.blog.findUnique({
    where: { blog_id: blogId },
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
    throw new CustomError(404, "Không tìm thấy blog");
  }

  const serializedBlog = { ...blog };

  await setCache(cacheKey, serializedBlog);

  return { blog: serializedBlog };
};

export const getAllPublishedBlogs = async (query, user) => {
  const {
    page = 1,
    limit = 10,
    sort = "desc",
    sortBy = "date",
    category,
    dateFrom,
    dateTo,
  } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);
  const orderDirection = sort === "asc" ? "asc" : "desc";

  // Build where clause
  const where = {
    draft: false,
    published: true,
  };

  // Filter by category slug
  if (category) {
    where.category = { slug: category };
  }

  // Filter by date range using date-fns
  if (dateFrom || dateTo) {
    where.published_at = {};
    if (dateFrom) {
      where.published_at.gte = startOfDay(parseISO(dateFrom));
    }
    if (dateTo) {
      where.published_at.lte = endOfDay(parseISO(dateTo));
    }
  }

  let orderBy;
  switch (sortBy) {
    case "views":
      orderBy = { activity_total_reads: orderDirection };
      break;
    case "likes":
      orderBy = { activity_total_likes: orderDirection };
      break;
    case "date":
    default:
      orderBy = { published_at: orderDirection };
      break;
  }

  const cacheKey = `blogs:list:page=${page}:limit=${limit}:sort=${sort}:sortBy=${sortBy}:cat=${category || "all"}:from=${dateFrom || ""}&to=${dateTo || ""}`;

  if (!user) {
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return { ...cachedData, fromCache: true };
    }
  }

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      include: {
        author: {
          select: {
            fullname: true,
            username: true,
            profile_img: true,
          },
        },
        category: { select: { id: true, name: true, slug: true } },
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy,
      skip,
      take,
    }),
    prisma.blog.count({ where }),
  ]);

  let serializedBlogs = blogs.map((blog) => ({ ...blog, liked: false }));

  const responseData = {
    blogs: serializedBlogs,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / take),
  };

  await setCache(cacheKey, responseData);

  if (user) {
    const blogIds = blogs.map((b) => b.id);
    const userLikes = await prisma.blogLike.findMany({
      where: {
        user_id: user.id,
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

  return responseData;
};

export const deleteBlogByUser = async (blogId, authorId) => {
  const blog = await prisma.blog.findUnique({
    where: { blog_id: blogId },
  });

  if (!blog) {
    throw new CustomError(404, "Không tìm thấy blog");
  }

  if (blog.author_id !== authorId) {
    throw new CustomError(403, "Bạn không có quyền xoá blog này");
  }

  await prisma.blog.delete({
    where: { blog_id: blogId },
  });

  await prisma.user.update({
    where: { id: authorId },
    data: { total_posts: { decrement: 1 } },
  });

  await deleteCache(`blogs:detail:${blogId}`);
  await deleteCacheByPattern("blogs:list:*");
};

export const getMyBlogs = async (authorId, query) => {
  const { page = 1, limit = 10 } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where: { author_id: authorId },
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
    prisma.blog.count({ where: { author_id: authorId } }),
  ]);

  return {
    blogs,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / take),
  };
};

export const searchBlogs = async ({ q, page = 1, limit = 10 }) => {
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const skip = (parsedPage - 1) * parsedLimit;

  if (!q || q.trim().length === 0) {
    return { blogs: [], total: 0, page: parsedPage, totalPages: 0 };
  }

  const where = {
    draft: false,
    published: true,
    OR: [
      { title: { contains: q, mode: "insensitive" } },
      { des: { contains: q, mode: "insensitive" } },
    ],
  };

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
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
          include: { tag: true },
        },
      },
      orderBy: { published_at: "desc" },
      skip,
      take: parsedLimit,
    }),
    prisma.blog.count({ where }),
  ]);

  return {
    blogs,
    total,
    page: parsedPage,
    totalPages: Math.ceil(total / parsedLimit),
  };
};

export const getAllCategories = async () => {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
};

export const getAllTags = async () => {
  const tags = await prisma.tag.findMany({
    select: {
      name: true,
    },
  });
  return tags.map((t) => t.name);
};

export const getTrendingBlogs = async () => {
  const cacheKey = "blogs:trending";
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const blogs = await prisma.blog.findMany({
    where: { draft: false, published: true },
    include: {
      author: {
        select: {
          fullname: true,
          username: true,
          profile_img: true,
        },
      },
    },
    orderBy: { activity_total_reads: "desc" },
    take: 5,
  });

  await setCache(cacheKey, blogs, 600); // cache 10 minutes
  return blogs;
};
