import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log('Token found:', token.substring(0, 20) + '...');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);

      req.user = await User.findById(decoded.id).select("-password");
      console.log('User from database:', req.user);

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error('Token error:', error);
      return res.status(401).json({ message: "Invalid token" });
    }
  } else {
    console.log('No token provided in headers');
    return res.status(401).json({ message: "No token provided" });
  }
};
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

// ✅ ADMIN MIDDLEWARE (for consistency)
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

// ✅ TRAINER ONLY (🔥 THIS WAS MISSING)
export const isTrainer = (req, res, next) => {
  if (req.user.role !== "trainer") {
    return res.status(403).json({ message: "Trainer access only" });
  }
  next();
};

// ✅ TRAINER OR ADMIN (for user management)
export const isTrainerOrAdmin = (req, res, next) => {
  if (req.user.role !== "trainer" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Trainer or Admin access only" });
  }
  next();
};

export const trainerApprovedOnly = (req, res, next) => {
  if (req.user.role !== "trainer") {
    return res.status(403).json({ message: "Trainer access only" });
  }

  if (req.user.status !== "approved") {
    return res.status(403).json({
      message: "Trainer account under review"
    });
  }

  next();
};
