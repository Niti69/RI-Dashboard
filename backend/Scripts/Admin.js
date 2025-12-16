require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Staff = require("../models/Staff");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

  await Staff.create({
    staffCode: "ADMIN-001",
    name: "Super Admin",
    userId: "ADMIN",
    password,
    role: "ADMIN",
    status: "ACTIVE",
    isFirstLogin: false
  });

  console.log("✅ Admin created");
  process.exit();
})();
