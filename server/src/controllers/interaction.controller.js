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
import CustomError from "../config/Custom-error.js";

export const getLikeStatus = async (req, res, next) => {
  try {
    const result = await getLikeStatusService(req.params.blog_id, req.user?.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const result = await toggleLikeService(req.params.blog_id, req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const result = await getCommentsService(
      req.params.blog_id,
      req.query,
      req.user?.id ?? null,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      throw new CustomError(400, "Nội dung bình luận không được để trống");
    }

    const newComment = await addCommentService(
      req.params.blog_id,
      comment,
      req.user.id,
    );
    res.status(201).json({ comment: newComment });
  } catch (error) {
    next(error);
  }
};

export const addReply = async (req, res, next) => {
  try {
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      throw new CustomError(400, "Nội dung phản hồi không được để trống");
    }

    const newReply = await addReplyService(
      req.params.blog_id,
      req.params.comment_id,
      comment,
      req.user.id,
    );
    res.status(201).json({ reply: newReply });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
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
    next(error);
  }
};

export const getCommentLikeStatus = async (req, res, next) => {
  try {
    const result = await getCommentLikeStatusService(
      req.params.comment_id,
      req.user?.id,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const toggleCommentLike = async (req, res, next) => {
  try {
    const { type = "UP" } = req.body;
    const result = await toggleCommentLikeService(
      req.params.comment_id,
      req.user.id,
      type,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
