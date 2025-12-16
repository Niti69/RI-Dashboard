// controller/authController.js
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Staff = require('../models/Staff')
const generateToken = require('../utils/generateToken')
const jwt = require("jsonwebtoken");
// After Admin review Set password 
const setPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.isEmailVerified = true;
    user.isFirstLogin = false;

    await user.save();

    res.json({
      success: true,
      message: "Password set successfully. You can now login.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Login For staffs
const login = async (req, res) => {
  const { userId, password } = req.body;

  const staff = await Staff.findOne({ userId }).select("+password");

  if (!staff) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (staff.status !== "ACTIVE") {
    return res.status(403).json({ message: "Account inactive" });
  }

  const isMatch = await bcrypt.compare(password, staff.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: staff._id, role: staff.role }, // ✅ id REQUIRED
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    success: true,
    token,
    staff: {
      id: staff._id,
      name: staff.name,
      role: staff.role,
      isFirstLogin: staff.isFirstLogin,
    },
  });
};

//Logout

const logout = async (req, res) => {
  // JWT is stateless → frontend clears token
  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = 
{login,
logout,
setPassword,
}