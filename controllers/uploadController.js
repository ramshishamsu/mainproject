import cloudinary from "../config/cloudinary.js";

/*
|--------------------------------------------------------------------------
| UPLOAD PROFILE IMAGE (CLOUDINARY)
|--------------------------------------------------------------------------
*/
export const uploadProfileImage = async (req, res) => {
  try {
       console.log("UPLOAD HIT ✅");
    console.log("FILE:", req.file);
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: "fitness_users",
        resource_type: "auto",  // Auto-detect file type
        access_mode: "public",   // Make publicly accessible
        type: "upload"          // Standard upload type
      },
      (error, result) => {
        if (error) {
                console.error("CLOUDINARY ERROR ❌", error);
          return res.status(500).json({ message: "Cloudinary upload failed" });
        }
      console.log("UPLOAD SUCCESS ✅", result.secure_url);
        res.json({
          imageUrl: result.secure_url
        });
      }
    );

    stream.end(req.file.buffer);
  } catch (error) {
    console.error("UPLOAD CONTROLLER ERROR ❌", error);
    res.status(500).json({ message: "Image upload error" });
  }
};
