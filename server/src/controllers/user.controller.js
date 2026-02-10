export const authMe = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại." });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        profile_img: user.profile_img,
        bio: user.bio,
        total_posts: user.total_posts,
        total_reads: Number(user.total_reads),
        created_at: user.created_at,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error("Lỗi khi gọi authMe:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
