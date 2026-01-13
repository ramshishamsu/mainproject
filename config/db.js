import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected successfully");
    return conn;
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    
    // Don't exit on connection error, let server retry
    if (err.name === 'MongooseServerSelectionError') {
      console.error("🔧 Server Selection Error - Check MongoDB URI");
    } else if (err.name === 'MongoNetworkError') {
      console.error("🌐 Network Error - Will retry connection");
    } else if (err.name === 'MongoTimeoutError') {
      console.error("⏰ Connection Timeout - Will retry");
    }
    
    // Log full error for debugging
    console.error("Full error details:", err);
    
    // Return the error instead of exiting
    throw err;
  }
};

export default connectDB;
