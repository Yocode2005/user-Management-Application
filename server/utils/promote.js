/**
 * CLI script: promote any registered user to admin
 *
 * Usage:
 *   node utils/promote.js danny@gmail.com
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const { promoteToAdmin } = require("./seeder");

const email = process.argv[2];
if (!email) {
  console.error("Usage: node utils/promote.js <email>");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => promoteToAdmin(email))
  .catch((err) => { console.error(err); process.exit(1); });
