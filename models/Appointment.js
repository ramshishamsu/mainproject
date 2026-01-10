import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true
    },
    date: Date,
    time: String,
    status: {
  type: String,
  enum: ["pending", "approved", "rejected", "completed"],
  default: "pending"
}

  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
