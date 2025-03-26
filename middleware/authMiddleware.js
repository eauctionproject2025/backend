const jwt = require("jsonwebtoken"); 

const authMiddleware = (req, res, next) => {
    // Get token from header
    const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

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

module.exports = authMiddleware