import cloudinary from "../config/cloudinary.js";

export const uploadProfileImage = async (req, res) => {
  try {
    console.log("🚀 UPLOAD HIT - Profile image upload started");
    
    // Check environment variables
    console.log("🔍 ENV CHECK:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "✅" : "❌ MISSING",
      api_key: process.env.CLOUDINARY_API_KEY ? "✅" : "❌ MISSING", 
      api_secret: process.env.CLOUDINARY_API_SECRET ? "✅" : "❌ MISSING",
    });

    if (!req.file) {
      console.error("❌ No file received in request");
      return res.status(400).json({ 
        success: false,
        message: "No image uploaded" 
      });
    }

    console.log("📁 File received:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "fitness_users",
          resource_type: "auto",
          access_mode: "public",
          type: "upload",
          format: "auto"
        },
        (error, result) => {
          if (error) {
            console.error("☁️ CLOUDINARY UPLOAD ERROR:", error);
            reject(error);
          } else {
            console.log("✅ CLOUDINARY UPLOAD SUCCESS:", result.secure_url);
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error("💥 UPLOAD CONTROLLER ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "Image upload failed", 
      error: error.message 
    });
  }
};