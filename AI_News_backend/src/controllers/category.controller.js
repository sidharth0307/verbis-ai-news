const slugify = require("slugify");

const CategoryModel = require("../models/CategoryModel");
const Article = require("../models/Article");

const CategoryController = {
  // ADMIN: Get everything (Active + Inactive)
  getAllCategoriesForAdmin: async (req, res) => {
    try {
      // Admin needs to see all categories to manage them
      const categories = await CategoryModel.find().sort({ order: 1 });
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // USER/FRONTEND: Get only active categories that have articles
  getActiveCategories: async (req, res) => {
    try {
      const categories = await CategoryModel.aggregate([
        // 1. Only consider active categories
        { $match: { isActive: true } },

        // 2. Lookup articles matching this category name
        {
          $lookup: {
            from: "articles",       // collection name (usually plural of model)
            localField: "name",
            foreignField: "category",
            as: "assoc_articles"
          }
        },

        // 3. Filter: Keep only where assoc_articles is NOT empty
        // Optimized: We don't need the full array, just existence
        {
          $match: {
            "assoc_articles.0": { $exists: true }
          }
        },

        // 4. Project: Remove the heavy assoc_articles array
        {
          $project: {
            assoc_articles: 0
          }
        },

        // 5. Sort by order
        { $sort: { order: 1 } }
      ]);

      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // ADMIN: Get categories with NO articles (Alert System)
  getEmptyCategories: async (req, res) => {
    try {
      const emptyCategories = await CategoryModel.aggregate([
        {
          $lookup: {
            from: "articles",
            localField: "name",
            foreignField: "category",
            as: "assoc_articles"
          }
        },
        {
          $match: {
            assoc_articles: { $size: 0 }
          }
        },
        {
          $project: {
            name: 1,
            slug: 1,
            isActive: 1
          }
        }
      ]);
      res.json(emptyCategories);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  //  CREATE CATEGORY
  createCategory: async (req, res) => {
    try {
      // We only DESTRUCTURE what is absolutely necessary from the user
      const { name, searchQuery } = req.body;

      if (!name || !searchQuery) {
        return res.status(400).json({ message: "Name and Search Query are required." });
      }

      // Auto-generate slug (User shouldn't have to provide this in a form)
      const slug = slugify(name, { lower: true, strict: true });

      // Check for duplicates
      const existing = await CategoryModel.findOne({ $or: [{ name }, { slug }] });
      if (existing) {
        return res.status(400).json({ message: "Category name or slug already exists." });
      }

      // Pass the whole req.body, but the Schema will fill in the blanks
      const newCategory = await CategoryModel.create({
        ...req.body,
        slug // overwrite or add the generated slug
      });

      res.status(201).json(newCategory);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // UPDATE CATEGORY 
  updateCategory: async (req, res) => {
    const { id } = req.params;
    try {
      const oldCategory = await CategoryModel.findById(id);
      if (!oldCategory) return res.status(404).json({ message: "Category not found" });

      // If slug is being changed, we MUST update all related articles
      const newSlug = req.body.slug ? slugify(req.body.slug, { lower: true, strict: true }) : oldCategory.slug;
      const nameChanged = req.body.name && req.body.name !== oldCategory.name;
      const slugChanged = newSlug !== oldCategory.slug;

      const updatedCategory = await CategoryModel.findByIdAndUpdate(
        id,
        { ...req.body, slug: newSlug },
        { new: true, runValidators: true }
      );

      // 3. CASCADE UPDATES TO ARTICLES
      if (nameChanged || slugChanged) {
        await Article.updateMany(
          { category: oldCategory.name },
          {
            category: updatedCategory.name,
            categorySlug: updatedCategory.slug
          }
        );
        console.log(`Cascaded updates to articles: ${updatedCategory.name}`);
      }

      res.json(updatedCategory);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE CATEGORY WITH MIGRATION
  deleteCategory: async (req, res) => {
    const { id } = req.params;

    // LOG EVERYTHING to find where the data is hiding
    console.log("Full Request Body:", req.body);

    // Some middleware configurations put DELETE data in req.query or req.params
    const migrateToId = req.body?.migrateToId || req.query?.migrateToId;

    console.log("Delete Request for ID:", id);
    console.log("Migration Target ID:", migrateToId);

    try {
      // Safety check to ensure models are loaded
      if (typeof Article === 'undefined') {
        throw new Error("Article model is not defined in CategoryController");
      }

      if (migrateToId === id) {
        return res.status(400).json({ message: "Cannot migrate articles to the same category being deleted." });
      }

      const categoryToDelete = await CategoryModel.findById(id);
      if (!categoryToDelete) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Use the name for the count
      const articleCount = await Article.countDocuments({ category: categoryToDelete.name });
      console.log(`Found ${articleCount} articles in ${categoryToDelete.name}`);

      if (articleCount > 0) {
        if (!migrateToId) {
          // THIS IS THE 400 ERROR YOUR FRONTEND IS WAITING FOR
          return res.status(400).json({
            message: `MIGRATE_NEEDED: This category has ${articleCount} articles.`
          });
        }

        const targetCategory = await CategoryModel.findById(migrateToId);
        if (!targetCategory) {
          return res.status(404).json({ message: "Target migration category not found" });
        }

        await Article.updateMany(
          { category: categoryToDelete.name },
          {
            category: targetCategory.name,
            categorySlug: targetCategory.slug
          }
        );
      }

      await CategoryModel.findByIdAndDelete(id);
      res.json({ message: "Category deleted successfully." });

    } catch (err) {
      // This will print the EXACT error in your Node.js terminal
      console.error("CRITICAL DELETE ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  },

  toggleStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const cat = await CategoryModel.findById(id);
      if (!cat) return res.status(404).json({ message: "Category not found" });

      cat.isActive = !cat.isActive;
      await cat.save();
      res.json({ message: `Category ${cat.isActive ? 'enabled' : 'disabled'}`, isActive: cat.isActive });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = CategoryController;