import {
  getDashboardStats as getDashboardStatsService,
  getNewUsersLast7Days as getNewUsersLast7DaysService,
  getBlogsByCategory as getBlogsByCategoryService,
} from "../../services/admin/dashboard.service.js";

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await getDashboardStatsService();
    return res.status(200).json(stats);
  } catch (error) {
    console.error("Lỗi khi lấy thống kê:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getNewUsersLast7Days = async (req, res) => {
  try {
    const data = await getNewUsersLast7DaysService();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi khi lấy thống kê người dùng mới:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getBlogsByCategory = async (req, res) => {
  try {
    const data = await getBlogsByCategoryService();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi khi lấy thống kê bài viết theo danh mục:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
