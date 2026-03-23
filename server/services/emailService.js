const nodemailer = require("nodemailer");

// Create reusable transporter
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: false, // true for port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/**
 * Base send function
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
  console.log(`📧  Email sent: ${info.messageId}`);
  return info;
};

// ── Template helpers ──────────────────────────────────

const baseTemplate = (content) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 24px;">UserBase</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">User Management Platform</p>
    </div>
    <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
      ${content}
    </div>
    <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
      © ${new Date().getFullYear()} UserBase. All rights reserved.
    </p>
  </div>
`;

/**
 * Welcome email after registration
 */
const sendWelcomeEmail = async (user, verificationToken) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  const html = baseTemplate(`
    <h2 style="color: #1e293b;">Welcome, ${user.fullName}! 🎉</h2>
    <p style="color: #475569;">Your account has been created successfully. Please verify your email address to get started.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verifyUrl}" style="background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Verify Email Address
      </a>
    </div>
    <p style="color: #94a3b8; font-size: 13px;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
  `);
  await sendEmail({ to: user.email, subject: "Welcome to UserBase – Verify Your Email", html });
};

/**
 * Password reset email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  const html = baseTemplate(`
    <h2 style="color: #1e293b;">Reset Your Password</h2>
    <p style="color: #475569;">Hi ${user.fullName}, we received a request to reset your password.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" style="background: #ef4444; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Reset Password
      </a>
    </div>
    <p style="color: #94a3b8; font-size: 13px;">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
  `);
  await sendEmail({ to: user.email, subject: "UserBase – Password Reset Request", html });
};

/**
 * Account status change notification
 */
const sendStatusChangeEmail = async (user, newStatus) => {
  const messages = {
    banned: { subject: "Your account has been suspended", color: "#ef4444", msg: "Your account has been suspended. Please contact support if you believe this is an error." },
    active: { subject: "Your account has been reactivated", color: "#22c55e", msg: "Great news! Your account has been reactivated. You can now log in." },
    inactive: { subject: "Your account has been deactivated", color: "#f59e0b", msg: "Your account has been temporarily deactivated." },
  };
  const { subject, color, msg } = messages[newStatus] || messages.inactive;
  const html = baseTemplate(`
    <h2 style="color: ${color};">Account Status Update</h2>
    <p style="color: #475569;">Hi ${user.fullName},</p>
    <p style="color: #475569;">${msg}</p>
    <p style="color: #94a3b8; font-size: 13px;">If you have questions, please contact our support team.</p>
  `);
  await sendEmail({ to: user.email, subject, html });
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail, sendStatusChangeEmail };
