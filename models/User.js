import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "trainer", "admin"],
      default: "user",
    },

    /* ================= USER STATUS ================= */
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "active", "blocked"],
      default: "active",
    },

    /* ================= PROFILE IMAGE ================= */
    profileImage: {
      type: String, // Cloudinary / S3 URL
      default: "",
    },

    /* ================= BODY METRICS ================= */
    age: {
      type: Number,
    },

    height: {
      type: Number, // cm
    },

    weight: {
      type: Number, // kg
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    /* ================= FITNESS GOALS ================= */
    fitnessGoal: {
      type: String,
      enum: [
        "weight_loss",
        "muscle_gain",
        "strength",
        "endurance",
        "general_fitness",
      ],
    },

    activityLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },

    /* ================= SUBSCRIPTION ================= */
    subscription: {
      plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
      },
      startDate: Date,
      endDate: Date,
      status: {
        type: String,
        enum: ["active", "expired"],
        default: "active",
      },
    },

    /* ================= PASSWORD RESET ================= */
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

/*
|--------------------------------------------------------------------------
| PASSWORD HASHING (BEFORE SAVE) — ✅ FIXED
|--------------------------------------------------------------------------
*/
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/*
|--------------------------------------------------------------------------
| PASSWORD MATCH METHOD
|--------------------------------------------------------------------------
*/
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
