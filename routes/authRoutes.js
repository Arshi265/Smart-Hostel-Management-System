import express from "express";
import { signup, login } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authmiddleware.js";
// it connects frontend request to controller 
const router = express.Router();
// TEST ROUTE (IMPORTANT)
router.get("/test", (req, res) => {
  res.send("Auth routes working 🚀");
});

router.post("/signup", signup);
router.post("/login", login);
// ye check krna h smjh nhi ya kya h 
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "This is protected data",
    user: req.user
  });
});


export default router;
// console.log("AUTH ROUTES LOADED ✅");
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