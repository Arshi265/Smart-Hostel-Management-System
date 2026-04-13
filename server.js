import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";


import userRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // IMPORTANT

// IMPORTANT
app.use("/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Hostel Complaint System Backend Running 🚀");
});

app.use("/user", userRoutes);
app.use("/complaint",complaintRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/profile", profileRoutes);
app.use("/announcements", announcementRoutes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});