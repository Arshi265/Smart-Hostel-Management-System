import express from "express";
import { signup, login } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authmiddleware.js";
// it connects frontend request to controller 
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "This is protected data",
    user: req.user
  });
});

export default router;