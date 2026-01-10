import express from "express";
import { register, login,  forgotPassword,
  resetPassword, logoutUser} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/logout", protect, logoutUser);

export default router;
