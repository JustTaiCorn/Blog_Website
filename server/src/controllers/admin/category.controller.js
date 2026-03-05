import {
  getAllCategories as getAllCategoriesService,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
} from "../../services/admin/category.service.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await getAllCategoriesService();
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, details } = req.body;
    const category = await createCategoryService(name, details);
    return res.status(201).json(category);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Category đã tồn tại" });
    }
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, details } = req.body;
    const category = await updateCategoryService(req.params.id, name, details);
    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await deleteCategoryService(req.params.id);
    return res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};
