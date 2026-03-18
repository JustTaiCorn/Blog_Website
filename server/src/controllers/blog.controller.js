import {
  createBlog as createBlogService,
  updateBlog as updateBlogService,
  getBlogById,
  getAllPublishedBlogs,
  deleteBlogByUser,
  getMyBlogs as getMyBlogsService,
  getAllCategories as getCategoriesService,
  getAllTags as getTagsService,
  searchBlogs as searchBlogsService,
  getTrendingBlogs as getTrendingBlogsService,
} from "../services/blog.service.js";
import CustomError from "../config/Custom-error.js";

export const createBlog = async (req, res, next) => {
  try {
    const result = await createBlogService(req.body, req.user.id);

    res.status(201).json({
      message: result.draft
        ? "Đã lưu bản nháp thành công"
        : "Blog đã được đăng thành công",
      blog_id: result.blog_id,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const result = await updateBlogService(
      req.params.blog_id,
      req.body,
      req.user.id,
    );

    res.status(200).json({
      message: "Cập nhật blog thành công",
      blog_id: result.blog_id,
    });
  } catch (error) {
    next(error);
  }
};

// Upload Banner
export const uploadBanner = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new CustomError(400, "Không có file nào được upload");
    }

    res.status(200).json({
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new CustomError(400, "Không có file nào được upload");
    }

    res.status(200).json({
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Blog
export const getBlog = async (req, res, next) => {
  try {
    const result = await getBlogById(req.params.blog_id);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Get All Blogs (Public)
export const getAllBlogs = async (req, res, next) => {
  try {
    const responseData = await getAllPublishedBlogs(req.query, req.user);

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// Get Categories
export const getCategories = async (req, res, next) => {
  try {
    const categories = await getCategoriesService();
    res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
};

// Get Tags
export const getTags = async (req, res, next) => {
  try {
    const tags = await getTagsService();
    res.status(200).json({ tags });
  } catch (error) {
    next(error);
  }
};

// Delete Blog
export const deleteBlog = async (req, res, next) => {
  try {
    await deleteBlogByUser(req.params.blog_id, req.user.id);

    res.status(200).json({ message: "Xoá blog thành công" });
  } catch (error) {
    next(error);
  }
};

// Search Blogs
export const searchBlogs = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const result = await searchBlogsService({ q, page, limit });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Get My Blogs (authenticated user's blogs)
export const getMyBlogs = async (req, res, next) => {
  try {
    const result = await getMyBlogsService(req.user.id, req.query);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Get Trending Blogs
export const getTrendingBlogs = async (req, res, next) => {
  try {
    const blogs = await getTrendingBlogsService();
    res.status(200).json({ blogs });
  } catch (error) {
    next(error);
  }
};
