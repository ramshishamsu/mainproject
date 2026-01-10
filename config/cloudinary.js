import dotenv from "dotenv";
dotenv.config(); // 🔥 MUST BE HERE

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 🔍 TEMP DEBUG (REMOVE AFTER TEST)
console.log(
  "CLOUDINARY INIT:",
  cloudinary.config().cloud_name,
  cloudinary.config().api_key
);

export default cloudinary;
