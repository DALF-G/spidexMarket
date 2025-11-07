const jwt = require("jsonwebtoken");
const { User } = require("../models/MarketDb");

exports.auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.userId);

    if (!user) return res.status(401).json({ message: "Invalid token" });
    if (!user.isActive) return res.status(403).json({ message: "Account inactive" });
    req.user = { userId: user._id.toString(), role: user.role };
    next();
  } 
  
  catch (err) {
    res.status(401).json({ message: "Auth failed", error: err.message });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
