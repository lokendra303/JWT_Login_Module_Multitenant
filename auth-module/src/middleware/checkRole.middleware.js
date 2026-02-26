const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.userType) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};

module.exports = checkRole;
