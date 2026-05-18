// routes/user.routes.js
const express = require("express");
const router = express.Router();
const { register, login, toggleSaveArticle, getUserInteractions, getAllUsers, deleteUser, toggleUserStatus, verifyOTP, subscribeToNewsletter, unsubscribe, forgotPassword, verifyResetCode, resetPassword } = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { authLimiter, interactionLimiter } = require("../middleware/rateLimit");

router.post("/register", authLimiter, register);
router.post('/verify-otp', authLimiter ,verifyOTP);
router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/verify-reset-code", authLimiter, verifyResetCode);
router.post("/reset-password", authLimiter, resetPassword);
  
router.post("/newsletter/subscribe", subscribeToNewsletter);
router.get("/newsletter/unsubscribe", unsubscribe);

router.get("/newsletter/test-trigger", async (req, res) => {
  try {
    if (req.query.secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    await runDailyNewsletter();
    res.status(200).json({ message: "Newsletter process started manually." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/save/:articleId", authMiddleware, interactionLimiter, toggleSaveArticle);

router.get("/interactions", authMiddleware, getUserInteractions);


// Admin Routes
const authorize = require("../middleware/authorize.middleware");
const { runDailyNewsletter } = require("../utils/newsletterWorker");

// Routes
router.get("/admin/all", authMiddleware, authorize('admin'), getAllUsers);
router.delete("/admin/:id", authMiddleware, authorize('admin'), deleteUser);
router.patch("/admin/:id/status", authMiddleware, authorize('admin'), toggleUserStatus);

module.exports = router;
