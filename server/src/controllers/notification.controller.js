import {
  getNotifications as getNotificationsService,
  getUnreadCount as getUnreadCountService,
  markAsRead as markAsReadService,
  markAllAsRead as markAllAsReadService,
} from "../services/notification.service.js";

export const getNotifications = async (req, res, next) => {
  try {
    const result = await getNotificationsService(req.user.id, req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const result = await getUnreadCountService(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const result = await markAsReadService(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await markAllAsReadService(req.user.id, req.query.type);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
