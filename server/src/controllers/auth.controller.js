import {
  signUpUser,
  verifyEmailToken,
  signInUser,
  signOutUser,
  refreshAccessToken,
  googleAuthUser,
} from "../services/auth.service.js";
import CustomError from "../config/Custom-error.js";

export const signUp = async (req, res, next) => {
  try {
    const { username, password, email, fullname } = req.body;

    if (!username || !password || !email || !fullname) {
      throw new CustomError(
        400,
        "Không thể thiếu username, password, email, và fullname",
      );
    }

    await signUpUser({ username, password, email, fullname });

    return res.status(201).json({
      message:
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      throw new CustomError(400, "Token không hợp lệ");
    }

    const user = await verifyEmailToken(token);

    return res.status(200).json({
      message: "Email đã được xác thực thành công!",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomError(400, "Thiếu email hoặc password.");
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
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    await signOutUser(token);

    if (token) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      throw new CustomError(401, "Token không tồn tại.");
    }

    const result = await refreshAccessToken(token);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const { accessToken: firebaseToken } = req.body;

    if (!firebaseToken) {
      throw new CustomError(400, "Thiếu Firebase token.");
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
    next(error);
  }
};
