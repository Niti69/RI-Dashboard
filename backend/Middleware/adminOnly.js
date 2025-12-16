module.exports = (req, res, next) => {
  if (!req.staff) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.staff.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};