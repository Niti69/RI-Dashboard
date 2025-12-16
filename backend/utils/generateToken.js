const jwt = require("jsonwebtoken");

module.exports = (staff) => {
  return jwt.sign(
    {
      id: staff._id,
      role: staff.role,
      staffCode: staff.staffCode,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "1d" }
  );
};