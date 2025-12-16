const bcrypt = require("bcryptjs");
const Staff = require("../models/Staff");

const generateStaffCode = () =>
  "STF-" + Math.floor(100000 + Math.random() * 900000);

exports.createStaff = async (req, res) => {
  try {
    const { name, userId, password, role, district, email, mobile } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const staff = await Staff.create({
      staffCode: generateStaffCode(),
      name,
      userId,
      password: hashed,
      role,
      district,
      email,
      mobile,
      createdBy: req.staff._id, // ✅ VALID HERE
    });

    res.status(201).json({
      success: true,
      staffId: staff.staffCode,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create staff" });
  }
};
