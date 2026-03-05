import {
  getAllComments as getAllCommentsService,
  deleteComment as deleteCommentService,
} from "../../services/admin/comment.service.js";

export const getAllComments = async (req, res) => {
  try {
    const result = await getAllCommentsService(req.query);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi lấy bình luận:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const adminDeleteComment = async (req, res) => {
  try {
    await deleteCommentService(req.params.id);
    return res.status(200).json({ message: "Đã xóa bình luận" });
  } catch (error) {
    console.error("Lỗi khi xóa bình luận:", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};
