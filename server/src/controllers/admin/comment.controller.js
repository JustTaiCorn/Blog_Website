import {
  getAllComments as getAllCommentsService,
  deleteComment as deleteCommentService,
} from "../../services/admin/comment.service.js";

export const getAllComments = async (req, res, next) => {
  try {
    const result = await getAllCommentsService(req.query);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const adminDeleteComment = async (req, res, next) => {
  try {
    await deleteCommentService(req.params.id);
    return res.status(200).json({ message: "Đã xóa bình luận" });
  } catch (error) {
    next(error);
  }
};
