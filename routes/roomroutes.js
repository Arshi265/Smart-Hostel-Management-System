import express from "express";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  getAvailableRooms,
  assignStudentToRoom,
  removeStudentFromRoom,
  updateRoom,
  deleteRoom,
  getRoomStats,
} from "../controllers/roomcontroller.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/rolemiddleware.js";

const router = express.Router();

// Public / Student routes
router.get("/available", authMiddleware, getAvailableRooms);

// Admin routes
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createRoom
);
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin"),
  getAllRooms
);
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("admin"),
  getRoomStats
);
router.patch(
  "/:id/assign",
  authMiddleware,
  roleMiddleware("admin"),
  assignStudentToRoom
);
router.patch(
  "/:id/remove",
  authMiddleware,
  roleMiddleware("admin"),
  removeStudentFromRoom
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateRoom
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteRoom
);

// Common
router.get("/:id", authMiddleware, getRoomById);

export default router;