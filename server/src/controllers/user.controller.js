import {
  getAuthenticatedUser,
  updateUserProfile,
  getUserSocialLinks,
  updateUserSocialLinks,
} from "../services/user.service.js";

export const authMe = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại." });
    }

    const userData = await getAuthenticatedUser(user);

    return res.status(200).json({ user: userData });
  } catch (error) {
    console.error("Lỗi khi gọi authMe:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullname, username, bio } = req.body;

    await updateUserProfile(req.user.id, { fullname, username, bio }, req.file);

    return res.status(200).json({
      message: "Cập nhật hồ sơ thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật hồ sơ:", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};

export const getSocialLinks = async (req, res) => {
  try {
    const socialLinks = await getUserSocialLinks(req.user.id);

    return res.status(200).json({ social_links: socialLinks });
  } catch (error) {
    console.error("Lỗi khi lấy social links:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateSocialLinks = async (req, res) => {
  try {
    await updateUserSocialLinks(req.user.id, req.body);

    return res.status(200).json({
      message: "Cập nhật liên kết xã hội thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật social links:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
