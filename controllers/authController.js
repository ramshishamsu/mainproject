import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import Trainer from "../models/Trainer.js";

/* =========================================================
   REGISTER USER
========================================================= */
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,               // ✅ READ ROLE
      phone,
      specialization,
      experience
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const emailLower = email.toLowerCase().trim();

    const exists = await User.findOne({ email: emailLower });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ CREATE USER WITH ROLE
    const user = await User.create({
      name,
      email: emailLower,
      password, // hashed by model
      role,     // 🔥 THIS IS THE FIX
      status: role === "trainer" ? "pending" : "approved"
    });

    // ✅ CREATE TRAINER PROFILE IF TRAINER
    if (role === "trainer") {
      if (!specialization || !experience) {
        return res.status(400).json({
          message: "Trainer details required"
        });
      }

      await Trainer.create({
        userId: user._id,
        phone,
        specialization,
        experience
      });
    }

    res.status(201).json({
      message:
        role === "trainer"
          ? "Trainer registered. Awaiting admin approval."
          : "User registered successfully"
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message });
  }
};



/* =========================================================
   LOGIN USER  ✅ bcrypt FIXED
========================================================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 🚨 SAFETY CHECK
    if (!user.password) {
      console.error("Password missing for user:", user.email);
      return res.status(500).json({ message: "Account setup error" });
    }

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
   

    // 3️⃣ Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 4️⃣ Send response (remove password here)
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   FORGOT PASSWORD
========================================================= */
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Save hashed token in DB
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    // Frontend URL (example)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    console.log("RESET PASSWORD LINK:", resetUrl);

    res.json({
      message: "Password reset link sent",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   RESET PASSWORD  ✅ bcrypt handled by model
========================================================= */
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Set new password (plain text)
    user.password = req.body.password;

    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save(); // 🔐 bcrypt hashes here

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   LOGOUT
========================================================= */
export const logoutUser = (req, res) => {
  res.json({ message: "Logout successful" });
};

/* =========================================================
   GET CURRENT USER
========================================================= */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log('getCurrentUser - User found:', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isTrainerApproved: user.isTrainerApproved
    });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isTrainerApproved: user.isTrainerApproved
      }
    });
  } catch (error) {
    console.error('getCurrentUser - Error:', error);
    res.status(500).json({ message: error.message });
  }
};
