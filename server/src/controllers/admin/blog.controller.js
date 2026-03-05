import {
  getAllBlogs as getAllBlogsService,
  deleteBlog as deleteBlogService,
} from "../../services/admin/blog.service.js";

export const getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await getAllBlogsService();
    return res.status(200).json(blogs);
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    await deleteBlogService(req.params.id);
    return res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    next(error);
  }
};
