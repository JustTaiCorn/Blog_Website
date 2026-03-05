import {
  getAllTags as getAllTagsService,
  createTag as createTagService,
  updateTag as updateTagService,
  deleteTag as deleteTagService,
} from "../../services/admin/tag.service.js";

export const getAllTags = async (req, res) => {
  try {
    const tags = await getAllTagsService();
    return res.status(200).json(tags);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    const tag = await createTagService(name);
    return res.status(201).json(tag);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Tag đã tồn tại" });
    }
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateTag = async (req, res) => {
  try {
    const { name } = req.body;
    const tag = await updateTagService(req.params.id, name);
    return res.status(200).json(tag);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const deleteTag = async (req, res) => {
  try {
    await deleteTagService(req.params.id);
    return res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};
