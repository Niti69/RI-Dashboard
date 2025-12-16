const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");

const staffAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const staff = await Staff.findById(decoded.id).select("-password");

    if (!staff) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.staff = staff;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = staffAuth;