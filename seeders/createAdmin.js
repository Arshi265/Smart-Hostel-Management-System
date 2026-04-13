import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB Connected");

    // check karo already hai ya nahi
    const existing = await User.findOne({ email: "admin@hostel.com" });

    if (existing) {
      console.log("⚡ Admin already exists");
      console.log("Email: admin@hostel.com");
      console.log("Password: admin123");
      process.exit(0);
    }

    // admin create karo
    await User.create({
      fullName: "Hostel Admin",
      email: "admin@hostel.com",
      password: "admin123",
      role: "admin",
    });

    console.log("🎉 Admin created successfully!");
    console.log("─────────────────────────────");
    console.log("Email   : admin@hostel.com");
    console.log("Password: admin123");
    console.log("Role    : admin");
    console.log("─────────────────────────────");

    process.exit(0);
  } catch (error) {
    console.log("❌ Error:", error.message);
    process.exit(1);
  }
};

createAdmin();