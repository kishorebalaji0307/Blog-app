import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MONGO_URL environment variable is missing in the configuration.");
    }
    await mongoose.connect(mongoUrl);
    console.log("MongoDB Connected 🚀");
  } catch (err) {
    console.error("Database connection failed ❌:", err.message || err);
    process.exit(1);
  }
};

export default connectDB;