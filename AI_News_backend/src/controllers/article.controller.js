const slugify = require("slugify");
const Article = require("../models/Article");
const { processNewsWithAI } = require("../services/newsAI.service");
const { fetchBanner } = require("../utils/aiBanner");
const { uploadSEOImage, deleteOldAsset } = require("../utils/cloudinaryHelper");
const settingsModel = require("../models/settingsModel");
const CategoryModel = require("../models/CategoryModel");
const User = require("../models/User");

/**
 * GET all articles
 */
exports.getAllArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      Article.find()
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(),
    ]);

    res.json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalArticles: total,
      articles,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET article by ID or slug
 */
exports.getArticleById = async (req, res) => {
  const idOrSlug = req.params.id;
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const article = isObjectId
      ? await Article.findById(idOrSlug).lean()
      : await Article.findOne({ slug: idOrSlug }).lean();

    if (!article) return res.status(404).json({ message: "Article not found" });

    return res.json(article);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * GET articles by category-slug
 */
exports.getByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const categorySlug = req.params.category.toLowerCase();
    const query = { categorySlug: categorySlug };

    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(query),
    ]);

    res.json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalArticles: total,
      articles,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET article by Nested Silo (Category + Slug)
 */
exports.getArticleByNestedSlug = async (req, res) => {
  const { category, slug } = req.params;
  try {
    const article = await Article.findOne({
      categorySlug: category.toLowerCase(),
      slug: slug,
    }).lean();

    if (!article) return res.status(404).json({ message: "Article not found" });

    return res.json(article);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST create article via AI
 */
exports.createArticleAI = async (req, res) => {
  try {
    const { title: originalTitle, content, url, source, category, categorySlug: bodyCategorySlug } = req.body;

    if (!content || !originalTitle) {
      return res.status(400).json({ message: "Original title and content required" });
    }

    const aiResult = await processNewsWithAI(content);
    const finalTitle = aiResult.title;
    const slug = slugify(finalTitle, { lower: true, strict: true });

    const { image, modelUsed: imageModel } = await fetchBanner(finalTitle, slug);

    const finalUrl = url || `https://verbis.news/ai-generated/${Date.now()}`;
    const finalSource = {
      name: source?.name || "Verbis AI",
      url: source?.url || finalUrl,
    };

    const settings = await settingsModel.findOne({ key: "model_config" });
    const daysToLive = settings?.articleExpiryDays || 7;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysToLive);

    let finalCategorySlug = "general";
    if (bodyCategorySlug) {
      finalCategorySlug = bodyCategorySlug;
    } else if (category) {
      const targetCategory = await CategoryModel.findOne({
        name: { $regex: new RegExp(`^${category}$`, 'i') },
      });
      if (targetCategory) finalCategorySlug = targetCategory.slug;
    }

    const article = await Article.create({
      ...req.body,
      title: finalTitle,
      slug,
      category: category || "General",
      categorySlug: finalCategorySlug,
      bannerImage: image,
      originalContent: content,
      aiContent: aiResult.rewrittenContent,
      summary: aiResult.summary,
      seoKeywords: aiResult.seoKeywords,
      modelUsed: `${aiResult.modelUsed} | ${imageModel}`,
      url: finalUrl,
      source: finalSource,
      expiresAt: expiryDate,
    });

    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ message: "Failed to create article", error: err.message });
  }
};

/**
 * PUT update article
 */
exports.updateArticle = async (req, res) => {
  try {
    const articleId = req.params.id;
    const article = await Article.findById(articleId);
    if (!article) return res.status(404).json({ message: "Article not found" });

    let updateData = { ...req.body };

    if (typeof updateData.seoKeywords === 'string') {
      updateData.seoKeywords = updateData.seoKeywords.split(',').map(k => k.trim()).filter(k => k !== "");
    }

    if (updateData.title && updateData.title !== article.title) {
      updateData.slug = slugify(updateData.title, { lower: true, strict: true });
    }

    if (req.file) {
      if (article.bannerImage) await deleteOldAsset(article.bannerImage);
      const slugForImage = updateData.slug || article.slug;
      const uploadResult = await uploadSEOImage(req.file.buffer, "verbis_news/articles", slugForImage);
      updateData.bannerImage = uploadResult.secure_url;
    }

    Object.assign(article, updateData);
    await article.save();

    res.json(article);
  } catch (err) {
    res.status(400).json({ message: "Update failed", error: err.message });
  }
};

/**
 * DELETE article
 */
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    res.json({ message: "Article deleted" });
  } catch {
    res.status(400).json({ message: "Delete failed" });
  }
};

/**
 * POST toggle like on article
 */
exports.toggleLike = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    const userId = req.user.id;
    const isLiked = article.likes.includes(userId);

    if (isLiked) {
      article.likes.pull(userId);
    } else {
      article.likes.push(userId);
    }

    article.likesCount = article.likes.length;
    await article.save();

    await User.findByIdAndUpdate(userId, 
      isLiked 
        ? { $pull: { likedArticles: article._id } } 
        : { $addToSet: { likedArticles: article._id } }
    );

    res.json({
      isLiked: !isLiked, // Consistent key for hydration
      likesCount: article.likesCount
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * SEARCH articles
 */
exports.searchArticles = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q) {
      return res.json({ page, limit, totalPages: 0, totalArticles: 0, articles: [] });
    }

    const query = {
      $or: [
        { category: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { summary: { $regex: q, $options: 'i' } }
      ]
    };

    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(query)
    ]);

    res.json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalArticles: total,
      articles
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/** POST add comment to article
 */
exports.addComment = async (req, res) => {
  try {
    const userProfile = await User.findById(req.user.id).select("username name");
    
    // 2. Determine the best display name
    const displayName =  userProfile?.name;
    const { comment, parentId } = req.body; // parentId is null for top-level, or a Comment ID for replies
    const article = await Article.findById(req.params.id);

    const newComment = {
      user: req.user.id,
      userName: displayName, 
      comment,
      parentId: parentId || null,
      likes: [],
      createdAt: new Date()
    };

    article.comments.push(newComment);
    await article.save();

    res.status(201).json(article.comments);
  } catch (err) {
    res.status(500).json({ message: "Post failed" });
  }
};

/** POST toggle like on comment
 */
exports.toggleCommentLike = async (req, res) => {
  try {
    const { id, commentId } = req.params; // Article ID and Comment ID
    const userId = req.user.id;

    const article = await Article.findById(id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    // Target the specific comment within the article
    const comment = article.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      comment.likes.pull(userId); // Unlike
    } else {
      comment.likes.push(userId); // Like
    }

    await article.save();

    // Return the full updated comments array so the frontend stays in sync
    res.json(article.comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/** DELETE comment from article
 */
exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const article = await Article.findById(id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    const comment = article.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Authorization: Only author or admin can delete
    if (comment.user.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Remove the comment and all its nested replies
    // We filter out the comment itself AND any comment that has it as a parentId
    article.comments = article.comments.filter(
      (c) => c._id.toString() !== commentId && c.parentId?.toString() !== commentId
    );

    await article.save();
    res.json(article.comments);
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

/** track view on article
 */
exports.trackView = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // findOneAndUpdate with $inc is the most efficient way
    const article = await Article.findOneAndUpdate(
      { slug: slug }, 
      { $inc: { views: 1 } }, 
      { new: true } // Returns the updated document so we can see the result
    );

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({ 
      message: "View tracked", 
      currentViews: article.views 
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};