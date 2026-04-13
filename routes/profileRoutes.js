import express from "express";
import {
  getProfile,
  updateProfile,
  uploadProfilePic,
  deleteProfilePic,
  changePassword,
} from "../controllers/profilecontroller.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multermiddleware.js";

const router = express.Router();

// sabhi routes ke liye auth required hai
router.use(authMiddleware);

// GET profile
router.get("/", getProfile);

// UPDATE profile
router.put("/update", updateProfile);

// UPLOAD profile pic
// single image upload, field name "profilePic"
router.post("/upload-pic", upload.single("profilePic"), uploadProfilePic);

// DELETE profile pic
router.delete("/delete-pic", deleteProfilePic);

// CHANGE password
router.post("/change-password", changePassword);

export default router;