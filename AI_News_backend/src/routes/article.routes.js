const express = require("express");
const router = express.Router();
const controller = require("../controllers/article.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { interactionLimiter, generalLimiter, searchLimiter } = require("../middleware/rateLimit");
const authorize = require("../middleware/authorize.middleware");
const { proxyArticleImage } = require("../controllers/imageProxy.controller");

// 1. SYSTEM ROUTES (High Priority)
router.get('/image-proxy/:slug/:imageName', proxyArticleImage);
router.get("/search", searchLimiter, controller.searchArticles);
router.get("/", generalLimiter, controller.getAllArticles);

// 2. THE NESTED SILO (The "Two-Param" Route)
// Matches: /api/articles/the-ai-life/future-of-robots
// This must stay ABOVE the single-param routes.
router.get("/:category/:slug", generalLimiter, controller.getArticleByNestedSlug);

// 3. THE CATEGORY LIST (The "One-Param" Route)
// Matches: /api/articles/the-ai-life
// This handles your silo feeds.
router.get("/:category", generalLimiter, controller.getByCategory);

// 4. THE HYBRID LOOKUP (Specific Path)
// Matches: /api/articles/v/id/65b123... OR /api/articles/v/id/my-slug
// We move this to a sub-path so it doesn't conflict with category names.
router.get("/v/id/:id", generalLimiter, controller.getArticleById);

// 5. ACTIONS
router.post("/:id/like", authMiddleware, interactionLimiter, controller.toggleLike);
router.post("/:id/comment", authMiddleware, interactionLimiter, controller.addComment);
router.patch("/:id/comments/:commentId/like", authMiddleware, controller.toggleCommentLike);
router.delete("/:id/comments/:commentId", authMiddleware, controller.deleteComment);

router.patch("/track-view/:slug",controller.trackView);

// 6. ADMIN ROUTES
router.post("/admin/create", authMiddleware, authorize("admin"), controller.createArticleAI);
router.put("/admin/update/:id", authMiddleware, authorize("admin"), controller.updateArticle);
router.delete("/admin/delete/:id", authMiddleware, authorize("admin"), controller.deleteArticle);

module.exports = router;