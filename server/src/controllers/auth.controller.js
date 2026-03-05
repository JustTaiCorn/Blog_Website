import {
  signUpUser,
  verifyEmailToken,
  signInUser,
  signOutUser,
  refreshAccessToken,
  googleAuthUser,
} from "../services/auth.service.js";

export const signUp = async (req, res) => {
  try {
    const { username, password, email, fullname } = req.body;

    if (!username || !password || !email || !fullname) {
      return res.status(400).json({
        message: "Không thể thiếu username, password, email, và fullname",
      });
    }

    await signUpUser({ username, password, email, fullname });

    return res.status(201).json({
      message:
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
    });
  } catch (error) {
    console.error("Lỗi khi gọi signUp:", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: "Token không hợp lệ" });
    }

    const user = await verifyEmailToken(token);

    return res.status(200).json({
      message: "Email đã được xác thực thành công!",
      user,
    });
  } catch (error) {
    console.error("Lỗi khi gọi verifyEmail:", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Thiếu email hoặc password." });
    }

    const result = await signInUser(email, password);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: result.refreshTokenTTL,
    });

    return res.status(200).json({
      message: `User ${result.user.fullname} đã đăng nhập!`,
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    console.error("Lỗi khi gọi signIn:", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};

export const signOut = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    await signOutUser(token);

    if (token) {
      res.clearCookie("refreshToken");
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Lỗi khi gọi signOut:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại." });
    }

    const result = await refreshAccessToken(token);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi gọi refreshToken:", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { accessToken: firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ message: "Thiếu Firebase token." });
    }

    const result = await googleAuthUser(firebaseToken);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: result.refreshTokenTTL,
    });

    return res.status(200).json({
      message: `Đăng nhập Google thành công!`,
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    console.error("Lỗi khi gọi googleAuth:", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi hệ thống" });
  }
};
