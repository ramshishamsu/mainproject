import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // 👤 Who paid
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // 🧑‍🏫 Trainer (ONLY for trainer-based payments)
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    // 💰 Amount paid
    amount: {
      type: Number,
      required: true
    },

    // 💳 Payment method
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "netbanking", "cash", "razorpay", "paypal"],
      required: true
    },

    // 📌 Payment status
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending"
    },

    // 💸 Trainer payout status
    released: {
      type: Boolean,
      default: false
    },

    // 🎟️ Linked subscription (VERY IMPORTANT)
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null
    },

    // 🔐 Razorpay / gateway transaction id
    transactionId: {
      type: String,
      unique: true,
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
