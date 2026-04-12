import express from "express";
import { 
  createFeedback,
  getAllFeedback,
  deleteFeedback
} from "../controllers/feedbackcontroller.js";

import authMiddleware from "../middlewares/authmiddleware.js";

const router = express.Router();


//  CREATE FEEDBACK (LOGIN REQUIRED)
router.post("/", authMiddleware, createFeedback);


// GET ALL FEEDBACK (you can also protect it for admin later)
router.get("/", getAllFeedback);


//  DELETE FEEDBACK (optional protected)
router.delete("/:id", authMiddleware, deleteFeedback);


export default router;