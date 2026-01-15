
 // ✅ MUST BE FIRST (BEFORE ANY OTHER IMPORTS)

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import withdrawalRoutes from "./routes/withdrawalRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js"; // NEW ROUTE

// Start server with database connection
connectDB().then(() => {
  console.log("🚀 Starting server after successful DB connection");
  
  const app = express();
  
  app.use(
    cors({
      origin: [
        "https://fitness-management-frontend.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma"],
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
  app.use("/api/payments", paymentRoutes);
  app.use("/api/nutrition", nutritionRoutes);
  app.use("/api/progress", progressRoutes);
  app.use("/api/goals", goalRoutes); // NEW ROUTE
  app.use("/api/ratings", ratingRoutes); // NEW ROUTE
  app.use("/api/admin", adminRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/withdrawals", withdrawalRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/plans", planRoutes);
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
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  });
}).catch(err => {
  console.error("❌ Failed to start server due to DB connection error:", err.message);
  console.error("🔧 Server will exit. Please check MongoDB connection.");
  process.exit(1);
});
