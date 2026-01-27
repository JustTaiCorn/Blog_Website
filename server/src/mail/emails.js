import {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { transporter, sender } from "./nodemailer.config.js";

export const sendVerificationEmail = async (
  email,
  username,
  verificationLink
) => {
  const mailOptions = {
    from: `"${sender.name}" <${sender.email}>`,
    to: email,
    subject: "Xác thực email của bạn - Blog Website",
    html: VERIFICATION_EMAIL_TEMPLATE.replace("{username}", username).replace(
      {verificationLink},
      verificationLink
    ),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully", info.response);
  } catch (error) {
    console.error(`Error sending verification email:`, error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email, username, loginLink) => {
  const mailOptions = {
    from: `"${sender.name}" <${sender.email}>`,
    to: email,
    subject: "Chào mừng đến với Blog Website!",
    html: WELCOME_EMAIL_TEMPLATE.replace("{username}", username).replace(
      "{loginLink}",
      loginLink
    ),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully", info.response);
  } catch (error) {
    console.error(`Error sending welcome email:`, error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};
