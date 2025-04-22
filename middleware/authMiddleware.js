const jwt = require("jsonwebtoken"); 
const User = require('../models/User');

const authMiddleware = (req, res, next) => {
    // Get token from header
    const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    console.log('Cookies:', req.cookies);
    console.log('Authorization Header:', req.headers.authorization);

    // Check if not token
    if (!token) return res.status(401).json({message: "Unauthorized"});

    // Verify token
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET); //decoded token
        req.user = decoded; 
        next();
    } catch(error){
        res.status(403).json({message: "Invalid token"})
    }
}
// 🔒 Protect: check if token exists and attach user to request
const protect = async (req, res, next) => {
    let token;
  
    console.log("Authorization Header:", req.headers.authorization);
  
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
        console.log("Extracted token:", token);
  
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
  
        if (!req.user) {
          return res.status(401).json({ message: "User not found" });
        }
  
        next();
      } catch (error) {
        console.error("JWT Error:", error);
        return res.status(401).json({ message: "Not authorized, token failed" });
      }
    }
  
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
  };
  
  // 🛡️ restrictTo: restrict access based on user role
  const restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'You do not have permission' });
      }
      next();
    };
  };

module.exports = {authMiddleware, protect, restrictTo};