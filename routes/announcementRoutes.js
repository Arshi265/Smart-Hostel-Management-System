import express from "express";
import {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
} from "../controllers/announcementController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/rolemiddleware.js";

const router = express.Router();

// Everyone (logged in)
router.get(
  "/",
  authMiddleware,
  getAllAnnouncements
);

router.get(
  "/:id",
  authMiddleware,
  getAnnouncementById
);

// Admin only
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createAnnouncement
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateAnnouncement
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteAnnouncement
);

router.patch(
  "/:id/toggle",
  authMiddleware,
  roleMiddleware("admin"),
  toggleAnnouncementStatus
);

export default router;