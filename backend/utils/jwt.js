const jwt = require("jsonwebtoken");

exports.signStaffToken = (staff) => {
  return jwt.sign(
    {
      id: staff._id,
      role: staff.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
};