import {
  getAllCategories as getAllCategoriesService,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
} from "../../services/admin/category.service.js";

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await getAllCategoriesService();
    return res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, details } = req.body;
    const category = await createCategoryService(name, details);
    return res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name, details } = req.body;
    const category = await updateCategoryService(req.params.id, name, details);
    return res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await deleteCategoryService(req.params.id);
    return res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    next(error);
  }
};
