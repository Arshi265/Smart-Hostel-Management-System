import express from "express";
import {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  deleteComplaint,
  getAssignedComplaints,
  getComplaintStats,
} from "../controllers/complaintController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/rolemiddleware.js";
import { upload } from "../middlewares/multermiddleware.js";

const router = express.Router();

// Student routes
router.post(
  "/",
  authMiddleware,
  upload.array("images", 5),
  createComplaint
);
router.get("/my", authMiddleware, getMyComplaints);

// Staff routes
router.get(
  "/assigned",
  authMiddleware,
  roleMiddleware("staff", "admin"),
  getAssignedComplaints
);

// Admin routes
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin"),
  getAllComplaints
);
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("admin"),
  getComplaintStats
);
router.patch(
  "/:id/assign",
  authMiddleware,
  roleMiddleware("admin"),
  assignComplaint
);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin", "staff"),
  updateComplaintStatus
);

// Common routes
router.get("/:id", authMiddleware, getComplaintById);
router.delete("/:id", authMiddleware, deleteComplaint);

export default router;