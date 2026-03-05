import {
  getAllTags as getAllTagsService,
  createTag as createTagService,
  updateTag as updateTagService,
  deleteTag as deleteTagService,
} from "../../services/admin/tag.service.js";

export const getAllTags = async (req, res, next) => {
  try {
    const tags = await getAllTagsService();
    return res.status(200).json(tags);
  } catch (error) {
    next(error);
  }
};

export const createTag = async (req, res, next) => {
  try {
    const { name } = req.body;
    const tag = await createTagService(name);
    return res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
};

export const updateTag = async (req, res, next) => {
  try {
    const { name } = req.body;
    const tag = await updateTagService(req.params.id, name);
    return res.status(200).json(tag);
  } catch (error) {
    next(error);
  }
};

export const deleteTag = async (req, res, next) => {
  try {
    await deleteTagService(req.params.id);
    return res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    next(error);
  }
};
