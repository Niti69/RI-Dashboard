const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.staff || !roles.includes(req.staff.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = allowRoles;