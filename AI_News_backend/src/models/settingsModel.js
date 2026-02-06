const mongoose = require('mongoose');

// We define a separate sub-schema for better validation and readability
const providerSchema = new mongoose.Schema({
  // 'name' is used as the unique identifier in your ingestion loop
  name: { type: String, required: true },
  baseUrl: { type: String, required: true },
  apiKey: { type: String, required: true },

  // payloadStructure matches your old code ('openai', 'anthropic', etc.)
  payloadStructure: {
    type: String,
    enum: ['openai', 'anthropic', 'custom', 'google'],
    default: 'openai'
  },

  // Active Model Selections
  textModel: { type: String },
  imageModel: { type: String },

  // --- NEW: Robustness & UI Support Fields ---
  availableTextModels: { type: [String], default: [] },
  availableImageModels: { type: [String], default: [] },
  fallbackTextModel: { type: String },
  fallbackImageModel: { type: String },
  isFallbackEnabled: { type: Boolean, default: true },
  // -------------------------------------------

  authHeader: { type: String, default: 'Authorization' },
  authPrefix: { type: String, default: 'Bearer' },

  // Category for filtering during ingestion
  category: { type: String, enum: ['text', 'image', 'both'] },

  // Metadata stores accountId (Cloudflare) or variant (Nano Banana)
  metadata: {
    type: Object,
    default: {}
  }
}, { _id: false });// Disable internal IDs for array sub-documents to keep it clean

const settingsSchema = new mongoose.Schema({
  key: { type: String, default: "model_config", unique: true },

  // --- Website General Info ---
  siteTitle: { type: String, default: "Verbis AI", trim: true },
  contactEmail: { type: String, default: "admin@verbis.ai", trim: true, lowercase: true },
  contactPhone: { type: String, default: "+1234567890", trim: true },

  // --- Active Provider Selection ---
  // The system uses these to know which provider from the pool to actually call
  activeTextProvider: { type: String, default: "" },
  activeImageProvider: { type: String, default: "" },

  // --- Centralized Provider Pool ---
  // This will store the analyzed results for both the Text Key and Image Key
  aiProviders: [providerSchema],

  // --- Branding Assets ---
  logo: {
    type: String,
    default: 'https://res.cloudinary.com/dljl9dd7m/image/upload/v1767986879/image-Photoroom_rlnkuz.png',
    trim: true
  },

  // --- Image Fallbacks ---
  fallbackBannerUrl: {
    type: String,
    default: 'https://res.cloudinary.com/dljl9dd7m/image/upload/v1767987146/Gemini_Generated_Image_n718c5n718c5n718_m4cjab.png',
    trim: true
  },

  // --- Retention Policy ---
  articleExpiryDays: {
    type: Number,
    default: 7, // Default to 7 days if not set
    min: 0      // 0 could represent "Never Delete"
  },

  //CronJob loop interval time
  cronSchedule: {
    type: String,
    default: "*/30 * * * *", //30 mins
    trim: true
  },

}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);