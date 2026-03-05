import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    res.status(429).json({
      message: "Bạn đã nhập sai quá nhiều lần, vui lòng thử lại sau 15 phút.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});
