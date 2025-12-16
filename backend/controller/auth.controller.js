const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");

const staffLogin = async (req, res) => {
  try {
    const { userId, password } = req.body;

    const staff = await Staff.findOne({ userId });

    if (!staff) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (staff.status !== "ACTIVE") {
      return res.status(403).json({ message: "Account disabled" });
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    staff.lastLogin = new Date();
    await staff.save();

    const token = jwt.sign(
      { id: staff._id, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      token,
      staff: {
        id: staff._id,
        name: staff.name,
        role: staff.role,
        isFirstLogin: staff.isFirstLogin,
      },
    });
  } catch (err) {
    console.error("staffLogin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {staffLogin}