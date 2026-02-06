const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/category.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");
const { generalLimiter } = require("../middleware/rateLimit");

/**
 * PUBLIC ROUTES
 * Used by the frontend to build navigation menus
 */
// Get only active categories (for the website menu)
router.get("/active", generalLimiter, CategoryController.getActiveCategories);


/**
 * ADMIN ROUTES
 * Requires Login and Admin Role
 */
// Get all categories including inactive ones (for the Admin Dashboard table)
router.get("/admin/all", authMiddleware, authorize("admin"), CategoryController.getAllCategoriesForAdmin);

// Get categories with NO articles (Alert System)
router.get("/admin/empty", authMiddleware, authorize("admin"), CategoryController.getEmptyCategories);

// Create a new category
router.post("/admin/create", authMiddleware, authorize("admin"), CategoryController.createCategory);

// Update category details (name, slug, searchQuery, etc.)
router.put("/admin/update/:id", authMiddleware, authorize("admin"), CategoryController.updateCategory);

// Toggle isActive status quickly without sending a full update body
router.patch("/admin/toggle/:id", authMiddleware, authorize("admin"), CategoryController.toggleStatus);

// Delete category with the mandatory migration logic
router.delete("/admin/delete/:id", authMiddleware, authorize("admin"), CategoryController.deleteCategory);

module.exports = router;