import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    // 👤 User who owns the subscription
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true // ✅ ONE active subscription per user
    },

    // 📦 Selected plan
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true
    },

    // 📅 Subscription start
    startDate: {
      type: Date,
      required: true
    },

    // ⏳ Subscription expiry
    endDate: {
      type: Date,
      required: true
    },

    // 🚦 Current status
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
