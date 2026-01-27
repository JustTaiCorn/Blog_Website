export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác thực Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #8b5cf6, #ec4899); padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1 style="color: white; margin: 0;">Xác thực Email của bạn</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Xin chào <strong>{username}</strong>,</p>
    <p>Cảm ơn bạn đã đăng ký! Vui lòng nhấn vào nút bên dưới để xác thực email của bạn:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{verificationLink}" style="background: linear-gradient(to right, #8b5cf6, #ec4899); color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Xác thực Email</a>
    </div>
    <p>Link này sẽ hết hạn sau <strong>24 giờ</strong>.</p>
    <p>Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
    <p style="margin-top: 30px;">Trân trọng,<br>Blog Website Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>Đây là email tự động, vui lòng không trả lời email này.</p>
  </div>
</body>
</html>
`;

export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chào mừng</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #8b5cf6, #ec4899); padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1 style="color: white; margin: 0;">Chào mừng đến với Blog!</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Xin chào <strong>{username}</strong>,</p>
    <p>Email của bạn đã được xác thực thành công! 🎉</p>
    <p>Bạn có thể bắt đầu sử dụng tài khoản để:</p>
    <ul>
      <li>Viết và chia sẻ blog của bạn</li>
      <li>Theo dõi các tác giả yêu thích</li>
      <li>Bình luận và tương tác với cộng đồng</li>
    </ul>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{loginLink}" style="background: linear-gradient(to right, #8b5cf6, #ec4899); color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Đăng nhập ngay</a>
    </div>
    <p style="margin-top: 30px;">Trân trọng,<br>Blog Website Team</p>
  </div>
</body>
</html>
`;
