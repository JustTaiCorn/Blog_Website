import {
  getAuthenticatedUser,
  updateUserProfile,
  getUserSocialLinks,
  updateUserSocialLinks,
  getPublicProfile,
} from "../services/user.service.js";
import CustomError from "../config/Custom-error.js";

export const authMe = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      throw new CustomError(401, "Người dùng không tồn tại.");
    }

    const userData = await getAuthenticatedUser(user);

    return res.status(200).json({ user: userData });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { fullname, username, bio } = req.body;

    await updateUserProfile(req.user.id, { fullname, username, bio }, req.file);

    return res.status(200).json({
      message: "Cập nhật hồ sơ thành công!",
    });
  } catch (error) {
    next(error);
  }
};

export const getSocialLinks = async (req, res, next) => {
  try {
    const socialLinks = await getUserSocialLinks(req.user.id);

    return res.status(200).json({ social_links: socialLinks });
  } catch (error) {
    next(error);
  }
};

export const updateSocialLinks = async (req, res, next) => {
  try {
    await updateUserSocialLinks(req.user.id, req.body);

    return res.status(200).json({
      message: "Cập nhật liên kết xã hội thành công!",
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicProfileCtrl = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id || null;
    const profile = await getPublicProfile(req.params.username, currentUserId);
    return res.status(200).json({ user: profile });
  } catch (error) {
    next(error);
  }
};
