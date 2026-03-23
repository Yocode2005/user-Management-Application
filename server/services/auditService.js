const AuditLog = require("../models/AuditLog");

/**
 * Create an audit log entry
 * @param {object} params
 */
const createAuditLog = async ({ action, performedBy, targetUser = null, details = {}, req = null }) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetUser,
      details,
      ipAddress: req ? (req.ip || req.connection?.remoteAddress) : null,
      userAgent: req ? req.headers["user-agent"] : null,
    });
  } catch (err) {
    // Audit log failure should never break the main flow
    console.error("Audit log error:", err.message);
  }
};

/**
 * Get audit logs with pagination and filters
 */
const getAuditLogs = async ({ page = 1, limit = 20, action, performedBy, targetUser, startDate, endDate } = {}) => {
  const filter = {};
  if (action) filter.action = action;
  if (performedBy) filter.performedBy = performedBy;
  if (targetUser) filter.targetUser = targetUser;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate("performedBy", "fullName email username")
      .populate("targetUser", "fullName email username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  return {
    logs,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};

module.exports = { createAuditLog, getAuditLogs };
