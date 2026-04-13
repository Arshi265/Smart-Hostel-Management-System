import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserProfile,
  deleteUser,
  getDashboardStats,
} from "../controllers/adminController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Sabhi admin routes ke liye
// auth + admin role dono required
router.use(authMiddleware, roleMiddleware("admin"));

router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/role", updateUserRole);
router.put("/users/:id", updateUserProfile);
router.delete("/users/:id", deleteUser);

export default router;