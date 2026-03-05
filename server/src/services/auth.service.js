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

export const signUpUser = async ({ username, password, email, fullname }) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    if (existingUser.username === username) {
      const error = new Error("Username đã tồn tại");
      error.statusCode = 409;
      throw error;
    }
    const error = new Error("Email đã tồn tại");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Tạo verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiresAt = new Date(
    Date.now() + VERIFICATION_TOKEN_TTL,
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

  return user;
};

export const verifyEmailToken = async (token) => {
  const user = await prisma.user.findFirst({
    where: {
      verification_token: token,
      verification_token_expires_at: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    const error = new Error("Link xác thực không hợp lệ hoặc đã hết hạn");
    error.statusCode = 400;
    throw error;
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

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullname: user.fullname,
  };
};

export const signInUser = async (email, password) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
      deleted: false,
    },
    include: {
      roles: true,
    },
  });

  if (!user) {
    const error = new Error("Email hoặc password không chính xác");
    error.statusCode = 401;
    throw error;
  }
  if (!user.verified) {
    const error = new Error(
      "Vui lòng xác thực email trước khi đăng nhập. Kiểm tra hộp thư của bạn.",
    );
    error.statusCode = 403;
    throw error;
  }

  const passwordCorrect = await bcrypt.compare(password, user.password);

  if (!passwordCorrect) {
    const error = new Error("Email hoặc password không chính xác");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL },
  );

  const refreshToken = crypto.randomBytes(64).toString("hex");

  await prisma.session.create({
    data: {
      user_id: user.id,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL),
    },
  });

  return {
    accessToken,
    refreshToken,
    refreshTokenTTL: REFRESH_TOKEN_TTL,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      profile_img: user.profile_img,
      bio: user.bio,
      roles: user.roles,
    },
  };
};

export const signOutUser = async (refreshToken) => {
  if (refreshToken) {
    await prisma.session.updateMany({
      where: { refresh_token: refreshToken },
      data: { revoked_at: new Date() },
    });
  }
};

export const refreshAccessToken = async (refreshToken) => {
  const session = await prisma.session.findUnique({
    where: { refresh_token: refreshToken },
  });

  if (!session) {
    const error = new Error("Token không hợp lệ hoặc đã hết hạn");
    error.statusCode = 403;
    throw error;
  }

  if (session.revoked_at) {
    const error = new Error("Token đã bị thu hồi.");
    error.statusCode = 403;
    throw error;
  }

  if (session.expires_at < new Date()) {
    const error = new Error("Token đã hết hạn.");
    error.statusCode = 403;
    throw error;
  }

  const accessToken = jwt.sign(
    { userId: session.user_id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL },
  );

  return { accessToken };
};

export const googleAuthUser = async (firebaseToken) => {
  const admin = await import("firebase-admin");

  let decodedToken;
  try {
    decodedToken = await admin.default.auth().verifyIdToken(firebaseToken);
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    const err = new Error("Token Google không hợp lệ.");
    err.statusCode = 401;
    throw err;
  }

  const { email, name, picture, uid } = decodedToken;

  if (!email) {
    const error = new Error("Không thể lấy email từ tài khoản Google.");
    error.statusCode = 400;
    throw error;
  }

  let user = await prisma.user.findFirst({
    where: { email, deleted: false },
    include: {
      roles: true,
    },
  });

  if (user) {
    if (!user.google_auth) {
      const error = new Error(
        "Email này đã được đăng ký bằng mật khẩu. Vui lòng đăng nhập bằng email/password.",
      );
      error.statusCode = 409;
      throw error;
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
        verified: true,
        password: "",
        roles: {
          create: { role: "USER" },
        },
      },
    });
  }

  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL },
  );

  const refreshTokenValue = crypto.randomBytes(64).toString("hex");

  await prisma.session.create({
    data: {
      user_id: user.id,
      refresh_token: refreshTokenValue,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL),
    },
  });

  return {
    accessToken,
    refreshToken: refreshTokenValue,
    refreshTokenTTL: REFRESH_TOKEN_TTL,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      profile_img: user.profile_img,
      bio: user.bio,
      roles: user.roles,
    },
  };
};
