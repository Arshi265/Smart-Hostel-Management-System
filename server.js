// 
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import userRoutes from "./routes/authRoutes.js";
import complaintRouter from "./routes/complaintRoutes.js";
import feedbackRouter from "./routes/feedbackroutes.js";
import profileRoutes from "./routes/profileRoutes.js";

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
  res.send("Backend running 🚀");
});

app.use("/user", userRoutes);
app.use("/complaint",complaintRouter);
app.use("/feedback", feedbackRouter);
app.use("/profile", profileRoutes)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});