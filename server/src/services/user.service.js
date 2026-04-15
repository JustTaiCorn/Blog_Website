import { prisma } from "../lib/prisma.js";
import cloudinary from "../config/cloudinary.config.js";
import CustomError from "../config/Custom-error.js";

export const getAuthenticatedUser = async (user) => {
  const socialLinks = await prisma.userSocialLinks.findUnique({
    where: { user_id: user.id },
  });

  return {
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
  };
};

export const updateUserProfile = async (userId, data, file) => {
  const updateData = {};

  if (data.fullname !== undefined) updateData.fullname = data.fullname.trim();
  if (data.username !== undefined) {
    const existing = await prisma.user.findFirst({
      where: {
        username: data.username.trim().toLowerCase(),
        id: { not: userId },
      },
    });
    if (existing) {
      throw new CustomError(409, "Username đã được sử dụng.");
    }
    updateData.username = data.username.trim().toLowerCase();
  }
  if (data.bio !== undefined) updateData.bio = data.bio;

  if (file) {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profile_img_id: true },
    });
    if (currentUser?.profile_img_id) {
      try {
        await cloudinary.uploader.destroy(currentUser.profile_img_id);
      } catch (e) {
        console.log("Không thể xóa ảnh cũ:", e.message);
      }
    }

    updateData.profile_img = file.path;
    updateData.profile_img_id = file.filename;
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
};

export const getUserSocialLinks = async (userId) => {
  let socialLinks = await prisma.userSocialLinks.findUnique({
    where: { user_id: userId },
  });

  if (!socialLinks) {
    socialLinks = await prisma.userSocialLinks.create({
      data: { user_id: userId },
    });
  }

  return {
    youtube: socialLinks.youtube,
    instagram: socialLinks.instagram,
    facebook: socialLinks.facebook,
    twitter: socialLinks.twitter,
    github: socialLinks.github,
    website: socialLinks.website,
  };
};

export const updateUserSocialLinks = async (userId, links) => {
  const { youtube, instagram, facebook, twitter, github, website } = links;

  await prisma.userSocialLinks.upsert({
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
};

export const getPublicProfile = async (username, currentUserId = null) => {
  const user = await prisma.user.findFirst({
    where: { username, deleted: false },
    select: {
      id: true,
      username: true,
      fullname: true,
      bio: true,
      profile_img: true,
      total_posts: true,
      created_at: true,
    },
  });

  if (!user) {
    throw new CustomError(404, "Không tìm thấy người dùng");
  }

  const [followers_count, following_count, is_following] = await Promise.all([
    prisma.follow.count({ where: { following_id: user.id } }),
    prisma.follow.count({ where: { follower_id: user.id } }),
    currentUserId
      ? prisma.follow
          .findUnique({
            where: {
              follower_id_following_id: {
                follower_id: currentUserId,
                following_id: user.id,
              },
            },
          })
          .then((f) => !!f)
      : Promise.resolve(false),
  ]);

  return {
    id: user.id,
    username: user.username,
    fullname: user.fullname,
    bio: user.bio,
    profile_img: user.profile_img,
    total_posts: user.total_posts,
    created_at: user.created_at,
    followers_count,
    following_count,
    is_following,
  };
};
