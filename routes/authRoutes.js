import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
} from "../controllers/authController.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();
// TEST ROUTE (IMPORTANT)
router.get("/test", (req, res) => {
  res.send("Auth routes working 🚀");
});

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.get("/me", authMiddleware, getCurrentUser);


export default router;
// console.log("AUTH ROUTES LOADED ");
// import express from "express";
// import { signup, login } from "../controllers/authController.js";
// import authMiddleware from "../middlewares/authmiddleware.js";

// const router = express.Router();

// // Public routes
// router.post("/signup", signup);
// router.post("/login", login);

// // Protected route
// router.get("/dashboard", authMiddleware, (req, res) => {
//   res.json({
//     message: "This is protected data",
//     user: req.user,
//   });
// });

// export default router;