import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| GET LOGGED-IN USER PROFILE
|--------------------------------------------------------------------------
*/
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE USER PROFILE (WITH PHOTO + GOALS)
|--------------------------------------------------------------------------
*/
export const updateProfile = async (req, res) => {
  try {
    console.log("UPDATE PROFILE HIT ✅");
    console.log("REQ USER:", req.user);
    console.log("BODY:", req.body);

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update only allowed fields
    user.age = req.body.age ?? user.age;
    user.height = req.body.height ?? user.height;
    user.weight = req.body.weight ?? user.weight;
    user.fitnessGoal = req.body.fitnessGoal ?? user.fitnessGoal;
    user.activityLevel = req.body.activityLevel ?? user.activityLevel;

    if (req.body.profileImage) {
      user.profileImage = req.body.profileImage;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        age: user.age,
        height: user.height,
        weight: user.weight,
        fitnessGoal: user.fitnessGoal,
        activityLevel: user.activityLevel
      }
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR ❌", error);
    res.status(500).json({ message: "Profile update failed" });
  }
};
export const getUserProfileForTrainer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL USERS (FOR TRAINERS AND ADMINS)
|--------------------------------------------------------------------------
*/
export const getAllUsers = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 10, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Filter by role if specified
    if (role) {
      filter.role = role;
    }
    
    // Filter by status if specified
    if (status) {
      filter.status = status;
    }
    
    // Search by name or email if specified
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Get users with pagination
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    res.status(200).json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("GET ALL USERS ERROR ❌", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE USER STATUS (FOR ADMINS)
|--------------------------------------------------------------------------
*/
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['approved', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.status = status;
    await user.save();
    
    res.json({ message: "User status updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
    res.status(500).json({ message: "Failed to update user status" });
  }
};
