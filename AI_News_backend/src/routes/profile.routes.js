const router = require("express").Router();
const { getMyProfile } = require("../controllers/profile.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { generalLimiter } = require("../middleware/rateLimit");

router.get("/me", authMiddleware,generalLimiter, getMyProfile);

module.exports = router;