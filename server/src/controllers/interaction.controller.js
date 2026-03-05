import {
  getLikeStatus as getLikeStatusService,
  toggleLike as toggleLikeService,
  getComments as getCommentsService,
  addComment as addCommentService,
  addReply as addReplyService,
  deleteComment as deleteCommentService,
  getCommentLikeStatus as getCommentLikeStatusService,
  toggleCommentLike as toggleCommentLikeService,
} from "../services/interaction.service.js";

export const getLikeStatus = async (req, res) => {
  try {
    const result = await getLikeStatusService(req.params.blog_id, req.user?.id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getLikeStatus:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const result = await toggleLikeService(req.params.blog_id, req.user.id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in toggleLike:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};

export const getComments = async (req, res) => {
  try {
    const result = await getCommentsService(
      req.params.blog_id,
      req.query,
      req.user?.id ?? null,
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getComments:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Nội dung bình luận không được để trống" });
    }

    const newComment = await addCommentService(
      req.params.blog_id,
      comment,
      req.user.id,
    );
    res.status(201).json({ comment: newComment });
  } catch (error) {
    console.error("Error in addComment:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};

export const addReply = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Nội dung phản hồi không được để trống" });
    }

    const newReply = await addReplyService(
      req.params.blog_id,
      req.params.comment_id,
      comment,
      req.user.id,
    );
    res.status(201).json({ reply: newReply });
  } catch (error) {
    console.error("Error in addReply:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const isAdmin = req.user.roles?.some((r) => r.role === "ADMIN");

    await deleteCommentService(
      req.params.blog_id,
      req.params.comment_id,
      req.user.id,
      isAdmin,
    );
    res.status(200).json({ message: "Đã xóa bình luận" });
  } catch (error) {
    console.error("Error in deleteComment:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};

export const getCommentLikeStatus = async (req, res) => {
  try {
    const result = await getCommentLikeStatusService(
      req.params.comment_id,
      req.user?.id,
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getCommentLikeStatus:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};

export const toggleCommentLike = async (req, res) => {
  try {
    const { type = "UP" } = req.body;
    const result = await toggleCommentLikeService(
      req.params.comment_id,
      req.user.id,
      type,
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in toggleCommentLike:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};
