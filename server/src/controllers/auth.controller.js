import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import { prisma } from "../lib/prisma.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../mail/emails.js";

dotenv.config();
const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;
const VERIFICATION_TOKEN_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const signUp = async (req, res) => {
  try {
    const { username, password, email, fullname } = req.body;

    if (!username || !password || !email || !fullname) {
      return res.status(400).json({
        message: "Không thể thiếu username, password, email, và fullname",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ message: "Username đã tồn tại" });
      }
      return res.status(409).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiresAt = new Date(
      Date.now() + VERIFICATION_TOKEN_TTL
    );

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        fullname,
        verification_token: verificationToken,
        verification_token_expires_at: verificationTokenExpiresAt,
        roles: {
          create: { role: "USER" },
        },
      },
    });

    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    await sendVerificationEmail(email, fullname, verificationLink);

    return res.status(201).json({
      message:
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
    });
  } catch (error) {
    console.error("Lỗi khi gọi signUp:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: "Token không hợp lệ" });
    }

    const user = await prisma.user.findFirst({
      where: {
        verification_token: token,
        verification_token_expires_at: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Link xác thực không hợp lệ hoặc đã hết hạn",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        verification_token: null,
        verification_token_expires_at: null,
      },
    });

    const loginLink = `${process.env.CLIENT_URL}/signin`;
    await sendWelcomeEmail(user.email, user.fullname, loginLink);

    return res.status(200).json({
      message: "Email đã được xác thực thành công!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
      },
    });
  } catch (error) {
    console.error("Lỗi khi gọi verifyEmail:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Thiếu email hoặc password." });
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
        deleted: false,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Email hoặc password không chính xác" });
    }

    // Kiểm tra user đã xác thực email chưa
    if (!user.verified) {
      return res.status(403).json({
        message:
          "Vui lòng xác thực email trước khi đăng nhập. Kiểm tra hộp thư của bạn.",
      });
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);

    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: "Email hoặc password không chính xác" });
    }

    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");

    await prisma.session.create({
      data: {
        user_id: user.id,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL),
      },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL,
    });

    return res.status(200).json({
      message: `User ${user.fullname} đã đăng nhập!`,
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        profile_img: user.profile_img,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Lỗi khi gọi signIn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signOut = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await prisma.session.updateMany({
        where: { refresh_token: token },
        data: { revoked_at: new Date() },
      });

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

    const session = await prisma.session.findUnique({
      where: { refresh_token: token },
    });

    if (!session) {
      return res
        .status(403)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    if (session.revoked_at) {
      return res.status(403).json({ message: "Token đã bị thu hồi." });
    }

    if (session.expires_at < new Date()) {
      return res.status(403).json({ message: "Token đã hết hạn." });
    }

    const accessToken = jwt.sign(
      { userId: session.user_id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Lỗi khi gọi refreshToken:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { accessToken: firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ message: "Thiếu Firebase token." });
    }

    const admin = await import("firebase-admin");

    let decodedToken;
    try {
      decodedToken = await admin.default.auth().verifyIdToken(firebaseToken);
    } catch (error) {
      console.error("Firebase token verification failed:", error);
      return res.status(401).json({ message: "Token Google không hợp lệ." });
    }

    const { email, name, picture, uid } = decodedToken;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Không thể lấy email từ tài khoản Google." });
    }

    let user = await prisma.user.findFirst({
      where: { email, deleted: false },
    });

    if (user) {
      if (!user.google_auth) {
        return res.status(409).json({
          message:
            "Email này đã được đăng ký bằng mật khẩu. Vui lòng đăng nhập bằng email/password.",
        });
      }
    } else {
      const username = email.split("@")[0] + "_" + uid.substring(0, 6);

      user = await prisma.user.create({
        data: {
          username,
          email,
          fullname: name || email.split("@")[0],
          profile_img: picture || null,
          google_auth: true,
          verified: true, // Google user tự động verified
          password: "", // Không cần password
          roles: {
            create: { role: "USER" },
          },
        },
      });
    }

    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    const refreshTokenValue = crypto.randomBytes(64).toString("hex");

    await prisma.session.create({
      data: {
        user_id: user.id,
        refresh_token: refreshTokenValue,
        expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL),
      },
    });

    res.cookie("refreshToken", refreshTokenValue, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL,
    });

    return res.status(200).json({
      message: `Đăng nhập Google thành công!`,
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        profile_img: user.profile_img,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Lỗi khi gọi googleAuth:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
