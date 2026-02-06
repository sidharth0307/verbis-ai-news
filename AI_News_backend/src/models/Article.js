const mongoose = require("mongoose");
const slugify = require("slugify");

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    seoKeywords: { type: [String], default: [] },
    slug: { type: String, unique: true }, // SEO-friendly article path
    categorySlug: { type: String, required: true },
    imageSEOName: { type: String },      // SEO-friendly image filename
    cloudinaryPublicId: { type: String },// The ACTUAL ID in Cloudinary
    aiContent: { type: String }, // News content rewritten by AI
    modelUsed: { type: String }, // AI model used
    url: { type: String, required: true }, // Original article link
    bannerImage: { type: String }, // GNews image
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      index: { expires: 0 }
    },
    lang: { type: String, default: "en" },
    source: {
      id: { type: String },
      name: { type: String },
      url: { type: String },
    },
    summary: { type: String }, // AI summary
    category: { type: String },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],
    likesCount: { type: Number, default: 0 }, // if you want likes
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        userName: String, // Denormalized for speed
        comment: { type: String, required: true },
        parentId: { type: mongoose.Schema.Types.ObjectId, default: null }, // The "Magic" field for replies
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        createdAt: { type: Date, default: Date.now }
      }
    ],
    isPurged: { type: Boolean, default: false },
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Auto-generate slug and image name before saving
ArticleSchema.pre('save', async function () {
  try {
    // If the controller already provided a slug, skip this logic
    if (this.isModified('title') && !this.slug) {
      let generatedSlug = slugify(this.title, { lower: true, strict: true });

      if (generatedSlug.length > 100) {
        generatedSlug = generatedSlug.substring(0, 100);
        const lastDash = generatedSlug.lastIndexOf('-');
        if (lastDash > 0) generatedSlug = generatedSlug.substring(0, lastDash);
      }

      this.slug = generatedSlug;
    }
    // No next() call needed for async hooks!
  } catch (err) {
    // If slugify fails, this will throw the error up to Article.create
    throw err;
  }
});

// Indexing for performance

ArticleSchema.index({ publishedAt: -1 });      // feed sorting
ArticleSchema.index({ category: 1 });          // category filter
ArticleSchema.index({ url: 1 }, { unique: true }); // deduplication
ArticleSchema.index({
  title: "text",
  summary: "text",
  "source.name": "text"
});

module.exports = mongoose.model("Article", ArticleSchema);
