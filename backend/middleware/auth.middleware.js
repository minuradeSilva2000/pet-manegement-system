import jwt from 'jsonwebtoken';
import User from '../models/user.modal';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    if (!decoded) {
      return res.status(403).json({ success: false, error: "Token is invalid" });
    }

    // Attach user to request
    const user = await User.findById(decoded._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("AuthMiddleware Error:", error);
    return res.status(500).json({ success: false, error: "Server error in auth middleware" });
  }
};

export default authMiddleware;