import User from "../models/User.js";
import Plan from "../models/Plan.js";
/*
|--------------------------------------------------------------------------
| GET LOGGED-IN USER PROFILE
|--------------------------------------------------------------------------
*/
export const getProfile = async (req, res) => {
  try {
    console.log("=== GET PROFILE DEBUG ===");
    const user = await User.findById(req.user._id).select("-password");
    console.log("User found:", !!user);
    console.log("User subscription:", user.subscription);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Manual populate if subscription.plan exists
    if (user.subscription && user.subscription.plan) {
      console.log("Subscription plan exists:", user.subscription.plan);
      try {
        const plan = await Plan.findById(user.subscription.plan);
        console.log("Found plan:", !!plan);
        if (plan) {
          user.subscription.plan = plan;
          console.log("Plan populated successfully");
        } else {
          console.log("Plan not found, using fallback");
          // Create a new subscription object with fallback plan
          user.subscription = {
            plan: {
              _id: user.subscription.plan.toString(),
              name: "Premium Plan",
              duration: 90,
              price: 999
            },
            startDate: user.subscription.startDate,
            endDate: user.subscription.endDate,
            status: user.subscription.status
          };
        }
      } catch (planError) {
        console.log("Error fetching plan:", planError);
        // Create a new subscription object with fallback plan
        user.subscription = {
          plan: {
            _id: user.subscription.plan.toString(),
            name: "Premium Plan",
            duration: 90,
            price: 999
          },
          startDate: user.subscription.startDate,
          endDate: user.subscription.endDate,
          status: user.subscription.status
        };
      }
    } else {
      console.log("No subscription or plan found");
    }

    console.log("Final subscription data:", JSON.stringify(user.subscription, null, 2));
    res.json(user);
  } catch (error) {
    console.log("Get profile error:", error);
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
    // Add subscription update
    if (req.body.subscription) {
      user.subscription = req.body.subscription;
    }
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
  }
};

/*
|--------------------------------------------------------------------------
| BLOCK/UNBLOCK USER (FOR ADMINS)
|--------------------------------------------------------------------------
*/
export const blockUnblockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle block status
    user.status = user.status === 'blocked' ? 'active' : 'blocked';
    await user.save();

    res.json({
      message: `User ${user.status === 'blocked' ? 'blocked' : 'unblocked'} successfully`,
      status: user.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getUserSubscription = async (req, res) => {
  try {
    console.log("=== getUserSubscription CALLED ===");
    console.log("User ID:", req.user._id);
    console.log("User role:", req.user.role);

    const user = await User.findById(req.user._id)
      .populate('subscription.plan', 'name duration price');

    console.log("Found user:", user ? "Yes" : "No");
    console.log("Subscription data:", user.subscription);

    res.json({
      status: user.subscription?.status || 'none',
      plan: user.subscription?.plan || null,
      startDate: user.subscription?.startDate || null,
      endDate: user.subscription?.endDate || null
    });
  } catch (error) {
    console.error("getUserSubscription error:", error);
    res.status(500).json({ message: error.message });
  }
};
/*
|--------------------------------------------------------------------------
| USER DATA GETTERS FOR DASHBOARD
|--------------------------------------------------------------------------
*/
export const getUserPayments = async (req, res) => {
  try {
    const Payment = require("../models/Payment.js");
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(payments || []); // Return empty array if no payments
  } catch (error) {
    console.error("getUserPayments error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserWorkouts = async (req, res) => {
  try {
    const Workout = require("../models/Workout.js");
    const workouts = await Workout.find({ user: req.user._id })
      .populate('trainer', 'name')
      .sort({ createdAt: -1 });
    res.json(workouts || []); // Return empty array if no workouts
  } catch (error) {
    console.error("getUserWorkouts error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserGoals = async (req, res) => {
  try {
    const Goal = require("../models/Goal.js");
    const goals = await Goal.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(goals || []); // Return empty array if no goals
  } catch (error) {
    console.error("getUserGoals error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserProgress = async (req, res) => {
  try {
    const Progress = require("../models/Progress.js");
    const progress = await Progress.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(progress || []); // Return empty array if no progress
  } catch (error) {
    console.error("getUserProgress error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserNutritionLogs = async (req, res) => {
  try {
    const NutritionPlan = require("../models/NutritionPlan.js");
    const plans = await NutritionPlan.find({ client: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ nutritionLogs: plans || [] }); // Return empty array if no plans
  } catch (error) {
    console.error("getUserNutritionLogs error:", error);
    res.status(500).json({ message: error.message });
  }
};