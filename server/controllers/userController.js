const User = require("../models/User");
const { ApiError, ApiResponse } = require("../utils/ApiError");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");
const { createAuditLog } = require("../services/auditService");
const { sendStatusChangeEmail } = require("../services/emailService");

// ── Helper: build query filters ───────────────────────
const buildUserFilter = (query) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.role) filter.role = query.role;
  if (query.isEmailVerified !== undefined) filter.isEmailVerified = query.isEmailVerified === "true";
  if (query.search) {
    filter.$text = { $search: query.search };
  }
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }
  return filter;
};

// ── GET /api/users — paginated list ───────────────────
exports.getAllUsers = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 10);
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  const skip = (page - 1) * limit;

  const filter = buildUserFilter(req.query);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -emailVerificationToken -passwordResetToken")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json(
    new ApiResponse(200, {
      users,
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    })
  );
};

// ── GET /api/users/:id — single user ──────────────────
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password -emailVerificationToken -passwordResetToken");
  if (!user) throw new ApiError(404, "User not found.");
  res.json(new ApiResponse(200, { user }));
};

// ── POST /api/users — admin creates user ──────────────
exports.createUser = async (req, res) => {
  const { username, email, password, fullName, role, status, dob, occupation, gender, phone } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    const field = existing.email === email ? "Email" : "Username";
    throw new ApiError(409, `${field} already exists.`);
  }

  const user = await User.create({
    username, email, password, fullName,
    role: role || "user",
    status: status || "active",
    isEmailVerified: true, // admin-created users skip verification
    dob: dob || null,
    occupation: occupation || "",
    gender: gender || "prefer_not_to_say",
    phone: phone || null,
  });

  await createAuditLog({
    action: "USER_CREATED",
    performedBy: req.user._id,
    targetUser: user._id,
    details: { createdBy: "admin" },
    req,
  });

  res.status(201).json(new ApiResponse(201, { user: user.toPublicJSON() }, "User created successfully."));
};

// ── PUT /api/users/:id — update user ──────────────────
exports.updateUser = async (req, res) => {
  const ALLOWED = [
    "fullName", "username", "email", "phone", "dob", "gender",
    "occupation", "company", "bio", "address", "socialLinks",
  ];
  // Admin can also update role
  if (req.user.role === "admin") ALLOWED.push("role");

  const updates = {};
  ALLOWED.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  if (Object.keys(updates).length === 0) throw new ApiError(400, "No valid fields provided to update.");

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) throw new ApiError(404, "User not found.");

  await createAuditLog({
    action: "USER_UPDATED",
    performedBy: req.user._id,
    targetUser: user._id,
    details: { updatedFields: Object.keys(updates) },
    req,
  });

  res.json(new ApiResponse(200, { user }, "User updated successfully."));
};

// ── PATCH /api/users/:id/status — change status ───────
exports.updateUserStatus = async (req, res) => {
  const { status } = req.body;
  const VALID = ["active", "inactive", "banned"];
  if (!VALID.includes(status)) throw new ApiError(400, `Status must be one of: ${VALID.join(", ")}`);

  // Prevent admin from banning themselves
  if (req.params.id === req.user._id.toString() && status === "banned") {
    throw new ApiError(403, "You cannot ban yourself.");
  }

  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!user) throw new ApiError(404, "User not found.");

  const actionMap = { banned: "USER_BANNED", active: "USER_ACTIVATED", inactive: "USER_DEACTIVATED" };
  await createAuditLog({
    action: actionMap[status],
    performedBy: req.user._id,
    targetUser: user._id,
    details: { newStatus: status },
    req,
  });

  // Notify user by email (non-blocking)
  sendStatusChangeEmail(user, status).catch(console.error);

  res.json(new ApiResponse(200, { user }, `User ${status} successfully.`));
};

// ── PATCH /api/users/:id/role — change role ───────────
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;
  const VALID = ["user", "admin", "moderator"];
  if (!VALID.includes(role)) throw new ApiError(400, `Role must be one of: ${VALID.join(", ")}`);

  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(403, "You cannot change your own role.");
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw new ApiError(404, "User not found.");

  await createAuditLog({
    action: "ROLE_CHANGED",
    performedBy: req.user._id,
    targetUser: user._id,
    details: { newRole: role },
    req,
  });

  res.json(new ApiResponse(200, { user }, "Role updated successfully."));
};

// ── DELETE /api/users/:id — soft delete ───────────────
exports.deleteUser = async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(403, "You cannot delete your own account via this endpoint.");
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");

  user.deletedAt = new Date();
  user.status = "inactive";
  await user.save({ validateBeforeSave: false });

  await createAuditLog({
    action: "USER_DELETED",
    performedBy: req.user._id,
    targetUser: user._id,
    req,
  });

  res.json(new ApiResponse(200, null, "User deleted successfully."));
};

// ── DELETE /api/users/bulk — bulk soft delete ─────────
exports.bulkDeleteUsers = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) throw new ApiError(400, "Provide an array of user IDs.");

  // Remove current admin from the list
  const filtered = ids.filter((id) => id !== req.user._id.toString());

  await User.updateMany(
    { _id: { $in: filtered } },
    { deletedAt: new Date(), status: "inactive" }
  );

  await createAuditLog({
    action: "BULK_DELETE",
    performedBy: req.user._id,
    details: { count: filtered.length, ids: filtered },
    req,
  });

  res.json(new ApiResponse(200, { deleted: filtered.length }, `${filtered.length} users deleted.`));
};

// ── GET /api/users/export — CSV download ──────────────
exports.exportUsers = async (req, res) => {
  const filter = buildUserFilter(req.query);
  const users = await User.find(filter)
    .select("fullName username email occupation company gender dob phone role status isEmailVerified lastLogin loginCount createdAt address")
    .lean();

  const headers = [
    "Full Name", "Username", "Email", "Occupation", "Company",
    "Gender", "Date of Birth", "Phone", "Role", "Status",
    "Email Verified", "Last Login", "Login Count",
    "City", "State", "Country", "Joined On",
  ];

  const escape = (val) => {
    if (val == null) return "";
    const str = String(val);
    return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const rows = users.map((u) => [
    u.fullName, u.username, u.email, u.occupation, u.company,
    u.gender, u.dob ? new Date(u.dob).toLocaleDateString() : "",
    u.phone, u.role, u.status, u.isEmailVerified,
    u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "",
    u.loginCount,
    u.address?.city, u.address?.state, u.address?.country,
    new Date(u.createdAt).toLocaleDateString(),
  ].map(escape).join(","));

  const csv = [headers.join(","), ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="users_${Date.now()}.csv"`);
  res.send(csv);
};

// ── GET /api/users/stats/overview ─────────────────────
exports.getStats = async (req, res) => {
  const [total, active, inactive, banned, newThisMonth, verifiedCount] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "active" }),
    User.countDocuments({ status: "inactive" }),
    User.countDocuments({ status: "banned" }),
    User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    }),
    User.countDocuments({ isEmailVerified: true }),
  ]);

  // Signups per month — last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlySignups = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  res.json(
    new ApiResponse(200, {
      overview: { total, active, inactive, banned, newThisMonth, verifiedCount },
      monthlySignups,
    })
  );
};

// ── POST /api/users/:id/avatar ─────────────────────────
exports.uploadAvatar = async (req, res) => {
  if (!req.file) throw new ApiError(400, "Please upload an image file.");

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");

  // Delete old avatar from Cloudinary if it exists
  if (user.avatar?.public_id) {
    await deleteFromCloudinary(user.avatar.public_id);
  }

  const { url, public_id } = await uploadToCloudinary(req.file.buffer);
  user.avatar = { url, public_id };
  await user.save({ validateBeforeSave: false });

  await createAuditLog({
    action: "AVATAR_UPDATED",
    performedBy: req.user._id,
    targetUser: user._id,
    req,
  });

  res.json(new ApiResponse(200, { avatar: user.avatar }, "Avatar updated successfully."));
};
