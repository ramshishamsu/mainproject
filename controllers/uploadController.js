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
        message: "No file uploaded" 
      });
    }

    console.log("📁 File received:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Determine resource type based on file type
    const resourceType = req.file.mimetype.startsWith("image/") ? "image" : "raw";

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "fitness_users",
          resource_type: resourceType,
          access_mode: "public",
          type: "upload",
          use_filename: true,
          unique_filename: false
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
      publicId: result.public_id,
      resourceType: resourceType
    });

  } catch (error) {
    console.error("💥 UPLOAD CONTROLLER ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "File upload failed", 
      error: error.message 
    });
  }
};

// Separate controller for document uploads (PDFs, certificates, etc.)
export const uploadDocument = async (req, res) => {
  try {
    console.log("📄 DOCUMENT UPLOAD HIT");
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "No document uploaded" 
      });
    }

    console.log("📄 Document received:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Upload document to Cloudinary as raw file
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "fitness_documents",
          resource_type: "raw",
          access_mode: "public",
          type: "upload",
          use_filename: true,
          unique_filename: false
        },
        (error, result) => {
          if (error) {
            console.error("☁️ DOCUMENT UPLOAD ERROR:", error);
            reject(error);
          } else {
            console.log("✅ DOCUMENT UPLOAD SUCCESS:", result.secure_url);
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      documentUrl: result.secure_url,
      publicId: result.public_id,
      originalName: req.file.originalname
    });

  } catch (error) {
    console.error("💥 DOCUMENT UPLOAD ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "Document upload failed", 
      error: error.message 
    });
  }
};
