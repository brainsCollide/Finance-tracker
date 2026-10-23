const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  signUp,
  signIn,
  logOut,
  getCurrentUser,
  forgotPassword,
  resetPassword,
} = require("../controller/authController");

const router = express.Router();

const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Terlalu banyak percobaan, coba lagi nanti" },
});

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/logout", logOut);
router.get("/current", getCurrentUser);
router.post("/forgot-password", forgotLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;