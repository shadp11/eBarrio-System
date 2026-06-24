import mongoose from "mongoose";
import { configDotenv } from "dotenv";

configDotenv();

const DATABASE_URL = process.env.DATABASE_URL;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DATABASE_URL, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`Database connected to ${conn.connection.host}`);
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected.");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected.");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB error:", err);
    });
  } catch (error) {
    console.log("Error connecting to database", error);
    process.exit(1);
  }
};
