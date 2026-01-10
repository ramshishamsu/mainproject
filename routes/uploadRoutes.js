import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import { uploadProfileImage } from "../controllers/uploadController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Upload user profile image
router.post(
  "/profile-image",
  protect,
  upload.single("image"),
  uploadProfileImage
);

export default router;
