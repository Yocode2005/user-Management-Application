const crypto = require("crypto");
const User = require("../models/User");
const { ApiError, ApiResponse } = require("../utils/ApiError");
const {
  generateAccessToken,
  generateRefreshToken,
  generateRandomToken,
  hashToken,
  setRefreshCookie,
  clearRefreshCookie,
} = require("../utils/generateTokens");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../services/emailService");
const { createAuditLog } = require("../services/auditService");
const jwt = require("jsonwebtoken");

// ── Register ──────────────────────────────────────────
exports.register = async (req, res) => {
  const { username, email, password, fullName, dob, occupation, gender, phone } = req.body;

  // Check duplicates
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    const field = existing.email === email ? "Email" : "Username";
    throw new ApiError(409, `${field} is already registered.`);
  }

  // Email verification token
  const rawToken = generateRandomToken();
  const hashedToken = hashToken(rawToken);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const user = await User.create({
    username,
    email,
    password,
    fullName,
    dob: dob || null,
    occupation: occupation || "",
    gender: gender || "prefer_not_to_say",
    phone: phone || null,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: expires,
  });

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user, rawToken).catch(console.error);

  await createAuditLog({ action: "USER_CREATED", performedBy: user._id, targetUser: user._id, req });

  res.status(201).json(
    new ApiResponse(201, { user: user.toPublicJSON() }, "Account created! Please check your email to verify.")
  );
};

// ── Verify email ──────────────────────────────────────
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) throw new ApiError(400, "Verification token is missing.");

  const hashedToken = hashToken(token);
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) throw new ApiError(400, "Token is invalid or has expired.");

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.json(new ApiResponse(200, null, "Email verified successfully! You can now log in."));
};

// ── Login ─────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (user.status === "banned") throw new ApiError(403, "Your account has been suspended.");
  if (user.status === "inactive") throw new ApiError(403, "Your account is inactive. Contact support.");

  // Update login stats
  user.lastLogin = new Date();
  user.loginCount += 1;
  await user.save({ validateBeforeSave: false });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  setRefreshCookie(res, refreshToken);

  await createAuditLog({ action: "LOGIN", performedBy: user._id, targetUser: user._id, req });

  res.json(
    new ApiResponse(200, { accessToken, user: user.toPublicJSON() }, "Logged in successfully.")
  );
};

// ── Refresh token ─────────────────────────────────────
exports.refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "No refresh token. Please log in.");

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "User no longer exists.");

  const accessToken = generateAccessToken(user._id, user.role);
  res.json(new ApiResponse(200, { accessToken }, "Token refreshed."));
};

// ── Logout ────────────────────────────────────────────
exports.logout = async (req, res) => {
  clearRefreshCookie(res);
  await createAuditLog({ action: "LOGOUT", performedBy: req.user._id, req });
  res.json(new ApiResponse(200, null, "Logged out successfully."));
};

// ── Forgot password ───────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond OK to prevent email enumeration
  if (!user) {
    return res.json(new ApiResponse(200, null, "If that email exists, a reset link has been sent."));
  }

  const rawToken = generateRandomToken();
  user.passwordResetToken = hashToken(rawToken);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
  await user.save({ validateBeforeSave: false });

  sendPasswordResetEmail(user, rawToken).catch(console.error);

  res.json(new ApiResponse(200, null, "If that email exists, a reset link has been sent."));
};

// ── Reset password ────────────────────────────────────
exports.resetPassword = async (req, res) => {
  const { token } = req.query;
  const { password } = req.body;
  if (!token) throw new ApiError(400, "Reset token is missing.");

  const hashedToken = hashToken(token);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) throw new ApiError(400, "Token is invalid or has expired.");

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  await createAuditLog({ action: "PASSWORD_RESET", performedBy: user._id, targetUser: user._id, req });

  res.json(new ApiResponse(200, null, "Password reset successfully. Please log in."));
};

// ── Get current user ──────────────────────────────────
exports.getMe = async (req, res) => {
  res.json(new ApiResponse(200, { user: req.user.toPublicJSON() }));
};
