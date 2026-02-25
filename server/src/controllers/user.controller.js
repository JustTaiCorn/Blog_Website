import { prisma } from "../lib/prisma.js";
import cloudinary from "../config/cloudinary.config.js";

export const authMe = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại." });
    }

    // Fetch social links if they exist
    const socialLinks = await prisma.userSocialLinks.findUnique({
      where: { user_id: user.id },
    });

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        profile_img: user.profile_img,
        profile_img_id: user.profile_img_id,
        bio: user.bio,
        total_posts: user.total_posts,
        total_reads: Number(user.total_reads),
        created_at: user.created_at,
        roles: user.roles,
        verified: user.verified,
        google_auth: user.google_auth,
        social_links: socialLinks
          ? {
              youtube: socialLinks.youtube,
              instagram: socialLinks.instagram,
              facebook: socialLinks.facebook,
              twitter: socialLinks.twitter,
              github: socialLinks.github,
              website: socialLinks.website,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Lỗi khi gọi authMe:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullname, username, bio } = req.body;

    // Build update data
    const updateData = {};

    if (fullname !== undefined) updateData.fullname = fullname.trim();
    if (username !== undefined) {
      const trimmedUsername = username.trim().toLowerCase();
      // Check uniqueness
      const existing = await prisma.user.findFirst({
        where: { username: trimmedUsername, id: { not: userId } },
      });
      if (existing) {
        return res.status(409).json({ message: "Username đã được sử dụng." });
      }
      updateData.username = trimmedUsername;
    }
    if (bio !== undefined) updateData.bio = bio;

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar from Cloudinary if exists
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { profile_img_id: true },
      });
      if (currentUser?.profile_img_id) {
        try {
          await cloudinary.uploader.destroy(currentUser.profile_img_id);
        } catch (e) {
          console.warn("Không thể xóa ảnh cũ:", e.message);
        }
      }

      updateData.profile_img = req.file.path;
      updateData.profile_img_id = req.file.filename;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { roles: true },
    });

    return res.status(200).json({
      message: "Cập nhật hồ sơ thành công!",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullname: updatedUser.fullname,
        profile_img: updatedUser.profile_img,
        profile_img_id: updatedUser.profile_img_id,
        bio: updatedUser.bio,
        total_posts: updatedUser.total_posts,
        total_reads: Number(updatedUser.total_reads),
        created_at: updatedUser.created_at,
        roles: updatedUser.roles,
        verified: updatedUser.verified,
        google_auth: updatedUser.google_auth,
      },
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật hồ sơ:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getSocialLinks = async (req, res) => {
  try {
    const userId = req.user.id;

    // Upsert — create with defaults if not exists
    const socialLinks = await prisma.userSocialLinks.upsert({
      where: { user_id: userId },
      update: {},
      create: { user_id: userId },
    });

    return res.status(200).json({
      social_links: {
        youtube: socialLinks.youtube,
        instagram: socialLinks.instagram,
        facebook: socialLinks.facebook,
        twitter: socialLinks.twitter,
        github: socialLinks.github,
        website: socialLinks.website,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy social links:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateSocialLinks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { youtube, instagram, facebook, twitter, github, website } = req.body;

    const socialLinks = await prisma.userSocialLinks.upsert({
      where: { user_id: userId },
      update: {
        youtube: youtube ?? "",
        instagram: instagram ?? "",
        facebook: facebook ?? "",
        twitter: twitter ?? "",
        github: github ?? "",
        website: website ?? "",
      },
      create: {
        user_id: userId,
        youtube: youtube ?? "",
        instagram: instagram ?? "",
        facebook: facebook ?? "",
        twitter: twitter ?? "",
        github: github ?? "",
        website: website ?? "",
      },
    });

    return res.status(200).json({
      message: "Cập nhật liên kết xã hội thành công!",
      social_links: {
        youtube: socialLinks.youtube,
        instagram: socialLinks.instagram,
        facebook: socialLinks.facebook,
        twitter: socialLinks.twitter,
        github: socialLinks.github,
        website: socialLinks.website,
      },
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật social links:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
