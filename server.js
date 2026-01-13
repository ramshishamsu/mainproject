
 // ✅ MUST BE FIRST (BEFORE ANY OTHER IMPORTS)

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import withdrawalRoutes from "./routes/withdrawalRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import goalRoutes from "./routes/goalRoutes.js"
connectDB();

const app = express();

app.use(
  cors({
    origin:  [
           "https://fitness-management-frontend.vercel.app",
              "http://localhost:5173",
              "http://localhost:5174",
  ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ VERY IMPORTANT: allow preflight explicitly
app.options("*", cors());

/* ================= API ROUTES ================= */
app.use(express.json());

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/goals", goalRoutes); // NEW ROUTE
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/upload", uploadRoutes);

/* ================= DEFAULT ================= */
app.get("/", (req, res) => {
  res.send("Fitness Management System API Running 🚀");
});

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
