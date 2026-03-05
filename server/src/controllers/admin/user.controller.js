import {
  getAllUsers as getAllUsersService,
  updateUserRole as updateUserRoleService,
} from "../../services/admin/user.service.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();
    return res.status(200).json(users);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId, role, action } = req.body;
    await updateUserRoleService(userId, role, action);
    return res.status(200).json({ message: "Cập nhật quyền thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật quyền người dùng:", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};
