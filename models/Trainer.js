import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    specialization: {
      type: String,
      required: true
    },
    experience: {
      type: Number,
      required: true
    },
    phone: String,
    profileImage: String,
    rating: {
      type: Number,
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    // Verification documents (id, certifications, etc.)
    documents: [
      {
        url: String,
        type: { type: String, enum: ["id", "certificate", "other"], default: "other" },
        verified: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
        verifiedAt: Date,
        verifiedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Trainer", trainerSchema);
