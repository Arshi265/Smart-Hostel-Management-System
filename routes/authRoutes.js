import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateProfile,
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authmiddleware.js";
// it connects frontend request to controller 
const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
// ye check krna h smjh nhi ya kya h 
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "This is protected data",
    user: req.user
  });
});

export default router;