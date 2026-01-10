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
