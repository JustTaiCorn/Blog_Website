import {
  getAllBlogs as getAllBlogsService,
  deleteBlog as deleteBlogService,
} from "../../services/admin/blog.service.js";

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await getAllBlogsService();
    return res.status(200).json(blogs);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    await deleteBlogService(req.params.id);
    return res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa blog:", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};
