import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trainer",
    required: true
  },
  day: String,
  startTime: String,
  endTime: String
});

export default mongoose.model("Availability", availabilitySchema);
