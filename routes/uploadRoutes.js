import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import { uploadProfileImage, uploadDocument } from "../controllers/uploadController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Upload profile image (images only)
router.post(
  "/profile-image",
  protect,
  upload.single("image"),
  uploadProfileImage
);

// Upload document (PDFs, certificates, etc.)
router.post(
  "/document",
  protect,
  upload.single("document"),
  uploadDocument
);

export default router;