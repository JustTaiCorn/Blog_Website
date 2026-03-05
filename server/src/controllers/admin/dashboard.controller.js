import {
  getDashboardStats as getDashboardStatsService,
  getNewUsersLast7Days as getNewUsersLast7DaysService,
  getBlogsByCategory as getBlogsByCategoryService,
} from "../../services/admin/dashboard.service.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await getDashboardStatsService();
    return res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

export const getNewUsersLast7Days = async (req, res, next) => {
  try {
    const data = await getNewUsersLast7DaysService();
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getBlogsByCategory = async (req, res, next) => {
  try {
    const data = await getBlogsByCategoryService();
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
