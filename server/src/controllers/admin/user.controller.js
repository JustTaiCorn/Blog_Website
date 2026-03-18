import {
  getAllUsers as getAllUsersService,
  updateUserRole as updateUserRoleService,
  deleteUser as deleteUserService,
} from "../../services/admin/user.service.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await getAllUsersService();
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { userId, role, action } = req.body;
    await updateUserRoleService(userId, role, action);
    return res.status(200).json({ message: "Cập nhật quyền thành công" });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteUserService(id);
    return res.status(200).json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    next(error);
  }
};
