// routes/user.routes.js
const express = require("express");
const router = express.Router();
const { register, login, toggleSaveArticle, getUserInteractions, getAllUsers, deleteUser, toggleUserStatus } = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { authLimiter, interactionLimiter } = require("../middleware/rateLimit");

router.post("/register", authLimiter, register);
router.post("/login", login);

router.post("/save/:articleId", authMiddleware, interactionLimiter, toggleSaveArticle);

router.get("/interactions", authMiddleware, getUserInteractions);


// Admin Routes
const authorize = require("../middleware/authorize.middleware");

// Routes
router.get("/admin/all", authMiddleware, authorize('admin'), getAllUsers);
router.delete("/admin/:id", authMiddleware, authorize('admin'), deleteUser);
router.patch("/admin/:id/status", authMiddleware, authorize('admin'), toggleUserStatus);

module.exports = router;
