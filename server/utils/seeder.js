const User = require("../models/User");

/**
 * Seeds a default admin account if no admin exists in the DB.
 * Also promotes any existing user to admin if their email matches ADMIN_EMAIL.
 * Runs automatically on server start.
 */
const seedAdmin = async () => {
  try {
    // ── Check if any admin already exists ────────────────
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log(`✅  Admin already exists: ${adminExists.email}`);
      return;
    }

    // ── Promote existing user if env email matches ────────
    const adminEmail    = process.env.ADMIN_EMAIL    || "admin@userbase.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";
    const adminUsername = process.env.ADMIN_USERNAME || "superadmin";
    const adminName     = process.env.ADMIN_NAME     || "Super Admin";

    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      existingUser.role            = "admin";
      existingUser.status          = "active";
      existingUser.isEmailVerified = true;
      await existingUser.save({ validateBeforeSave: false });
      console.log(`🔑  Promoted existing user to admin: ${adminEmail}`);
      return;
    }

    // ── Create a fresh admin account ──────────────────────
    await User.create({
      username:        adminUsername,
      email:           adminEmail,
      password:        adminPassword,
      fullName:        adminName,
      role:            "admin",
      status:          "active",
      isEmailVerified: true,
    });

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔑  Default admin account created!");
    console.log(`    Email    : ${adminEmail}`);
    console.log(`    Password : ${adminPassword}`);
    console.log("    ⚠️  Change this password after first login!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } catch (err) {
    console.error("❌  Seeder error:", err.message);
  }
};

/**
 * Promote any existing user to admin by their email.
 * Usage: node utils/promote.js danny@gmail.com
 */
const promoteToAdmin = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    console.error(`❌  No user found with email: ${email}`);
    process.exit(1);
  }
  user.role            = "admin";
  user.status          = "active";
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });
  console.log(`✅  ${user.fullName} (${email}) is now an Admin!`);
  process.exit(0);
};

module.exports = { seedAdmin, promoteToAdmin };
