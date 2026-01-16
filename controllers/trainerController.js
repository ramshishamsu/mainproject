import Trainer from "../models/Trainer.js";
import Payment from "../models/Payment.js";
import Workout from "../models/Workout.js";

import bcrypt from "bcryptjs";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
/*
|--------------------------------------------------------------------------
| Register Trainer Controller
|--------------------------------------------------------------------------
| This controller:
| 1. Creates a User (for authentication)
| 2. Creates a Trainer (for profile data)
| 3. Sets trainer status as PENDING
|--------------------------------------------------------------------------
*/

export const registerTrainer = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      experience
    } = req.body;

    // -------------------- VALIDATION --------------------
    if (
      !name ||
      !email ||
      !password ||
      !specialization ||
      !experience
    ) {
      return res.status(400).json({
        message: "All required fields must be filled"
      });
    }

    // -------------------- CHECK EXISTING USER --------------------
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    // -------------------- HASH PASSWORD --------------------
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // -------------------- CREATE USER (AUTH) --------------------
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "trainer",        // IMPORTANT
      status: "pending"       // IMPORTANT
    });

    // -------------------- CREATE TRAINER (PROFILE) --------------------
    const trainer = await Trainer.create({
      userId: user._id,       // LINK USER & TRAINER
      specialization,
      experience,
      phone,
      profileImage: ""        // add later (upload)
    });

    // -------------------- RESPONSE --------------------
    return res.status(201).json({
      message: "Trainer registered successfully. Pending admin approval.",
      userId: user._id,
      trainerId: trainer._id
    });

  } catch (error) {
    console.error("Register Trainer Error:", error);
    return res.status(500).json({
      message: "Server error while registering trainer"
    });
  }
};

/*
|--------------------------------------------------------------------------
| APPROVE TRAINER (ADMIN ONLY)
|--------------------------------------------------------------------------
| Who: Admin
| What: Approves trainer registration
*/
export const approveTrainer = async (req, res) => {
  try {
    const userId = req.params.id;

    // 1️⃣ Update USER status (THIS CONTROLS LOGIN)
    const user = await User.findByIdAndUpdate(
      userId,
      { status: "approved" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // 2️⃣ Optional: update trainer approved flag
    await Trainer.findOneAndUpdate(
      { userId },
      { status: "approved" }
    );

    res.status(200).json({
      message: "Trainer approved successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
|--------------------------------------------------------------------------
| GET APPROVED TRAINERS (USER)
|--------------------------------------------------------------------------
*/
export const getTrainers = async (req, res) => {
  try {
    // Include user info for display (name, email)
    const trainers = await Trainer.find({ status: "approved" }).populate("userId", "name email");
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/*
|--------------------------------------------------------------------------
| GET TRAINER PROFILE
|--------------------------------------------------------------------------
| Who: Trainer (logged-in)
| What: Fetch own trainer profile
| Why: Trainer dashboard & self-management
*/
export const getTrainerProfile = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({
      userId: req.user._id
    }).populate("userId", "name email");

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer profile not found"
      });
    }

    // Transform document URLs to ensure public access
    if (trainer.documents && trainer.documents.length > 0) {
      trainer.documents = trainer.documents.map(doc => {
        // Extract public_id from existing URL and create unsigned URL
        const urlParts = doc.url.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        return {
          ...doc,
          url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/fl_attachment/${publicId}`
        };
      });
    }

    res.status(200).json(trainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateTrainerProfile = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({
      userId: req.user._id
    });

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer not found"
      });
    }

    // update fields
    trainer.specialization =
      req.body.specialization || trainer.specialization;

    trainer.experience =
      req.body.experience || trainer.experience;

    trainer.phone =
      req.body.phone || trainer.phone;

    // update image if uploaded
    if (req.file) {
      trainer.profileImage = req.file.path;
    }

    await trainer.save();

    res.status(200).json({
      message: "Trainer profile updated successfully",
      trainer
    });

  } catch (error) {
    console.error("Update Trainer Profile Error:", error);
    res.status(500).json({
      message: "Server error while updating profile"
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPLOAD VERIFICATION DOCUMENT (TRAINER)
|--------------------------------------------------------------------------
*/
export const uploadVerificationDoc = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No document uploaded" });
    }

    const trainer = await Trainer.findOne({ userId: req.user._id });
    if (!trainer) {
      return res.status(404).json({ message: "Trainer profile not found" });
    }

    // Upload to Cloudinary via uploader.upload_stream
    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { 
          folder: "trainer_documents",
          resource_type: "auto",  // Auto-detect file type (image, pdf, etc.)
          access_mode: "public",   // Make publicly accessible
          type: "upload"          // Standard upload type
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Ensure the uploaded resource is explicitly public
    try {
      await cloudinary.api.resource(uploaded.public_id, {
        resource_type: "auto",
        type: "upload"
      });
    } catch (error) {
      console.warn("Could not verify resource access:", error.message);
    }

    const doc = {
      url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/fl_attachment/${uploaded.public_id}`,
      type: req.body.type || "other",
      verified: false,
      uploadedAt: new Date()
    };

    trainer.documents = trainer.documents || [];
    trainer.documents.push(doc);
    await trainer.save();

    res.status(201).json({ message: "Document uploaded", doc });
  } catch (error) {
    console.error("Upload verification doc error:", error);
    res.status(500).json({ message: error.message });
  }
};


/*
|--------------------------------------------------------------------------
| GET TRAINER EARNINGS
|--------------------------------------------------------------------------
*/
export const getTrainerEarnings = async (req, res) => {
  try {
    const payments = await Payment.find({
      trainer: req.user._id,
      released: true
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ totalEarnings: total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getTrainerUsers = async (req, res) => {
  try {
    // If ?all=true return all registered users (limited fields)
    if (req.query.all === "true") {
      const users = await User.find({ role: "user" }).select("name email goal");
      return res.status(200).json(users);
    }

    // Find the trainer document for the logged-in user
    const trainer = await Trainer.findOne({ userId: req.user._id });
    if (!trainer) {
      return res.status(404).json({ message: "Trainer profile not found" });
    }

    // Find workouts assigned by this trainer
    const workouts = await Workout.find({
      trainer: trainer._id,
    }).populate("user", "name email");

    // Remove duplicate users
    const uniqueUsers = new Map();

    workouts.forEach((w) => {
      if (w.user) {
        uniqueUsers.set(w.user._id.toString(), w.user);
      }
    });

    res.status(200).json(Array.from(uniqueUsers.values()));
  } catch (error) {
    console.error("Get Trainer Users Error:", error);
    res.status(500).json({ message: "Failed to fetch trainer users" });
  }
};

/*
|--------------------------------------------------------------------------
| GET TRAINER CLIENTS
|--------------------------------------------------------------------------
| - Get all clients assigned to a trainer
| - Based on workouts and appointments
*/
export const getTrainerClients = async (req, res) => {
  try {
    // Get all users (not just assigned ones) so trainer can create nutrition plans
    const users = await User.find({ role: 'user' })
      .select('name email _id')
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("Get Trainer Clients Error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

