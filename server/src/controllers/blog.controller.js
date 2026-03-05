import {
  createBlog as createBlogService,
  updateBlog as updateBlogService,
  getBlogById,
  getAllPublishedBlogs,
  deleteBlogByUser,
  getMyBlogs as getMyBlogsService,
  getAllCategories as getCategoriesService,
  getAllTags as getTagsService,
} from "../services/blog.service.js";

export const createBlog = async (req, res) => {
  try {
    const result = await createBlogService(req.body, req.user.id);

    res.status(201).json({
      message: result.draft
        ? "Đã lưu bản nháp thành công"
        : "Blog đã được đăng thành công",
      blog_id: result.blog_id,
    });
  } catch (error) {
    console.error("Error in createBlog:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi khi tạo blog" });
  }
};

export const updateBlog = async (req, res) => {
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
    console.error("Error in updateBlog:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi khi cập nhật blog" });
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
    const result = await getBlogById(req.params.blog_id);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getBlog:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi khi lấy thông tin blog" });
  }
};

// Get All Blogs (Public)
export const getAllBlogs = async (req, res) => {
  try {
    const responseData = await getAllPublishedBlogs(req.query, req.user);

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in getAllBlogs:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi khi lấy danh sách blog" });
  }
};

// Get Categories
export const getCategories = async (req, res) => {
  try {
    const categories = await getCategoriesService();
    res.status(200).json({ categories });
  } catch (error) {
    console.error("Error in getCategories:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh mục" });
  }
};

// Get Tags
export const getTags = async (req, res) => {
  try {
    const tags = await getTagsService();
    res.status(200).json({ tags });
  } catch (error) {
    console.error("Error in getTags:", error);
    res.status(500).json({ message: "Lỗi khi lấy tags" });
  }
};

// Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    await deleteBlogByUser(req.params.blog_id, req.user.id);

    res.status(200).json({ message: "Xoá blog thành công" });
  } catch (error) {
    console.error("Error in deleteBlog:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi khi xoá blog" });
  }
};

// Get My Blogs (authenticated user's blogs)
export const getMyBlogs = async (req, res) => {
  try {
    const result = await getMyBlogsService(req.user.id, req.query);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getMyBlogs:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi khi lấy danh sách blog" });
  }
};
