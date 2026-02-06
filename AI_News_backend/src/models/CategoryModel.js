const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  searchQuery: { type: String, required: true }, // The GNews keyword
  isActive: { type: Boolean, default: true },   // For disabling rendering
  articlesPerDay: { type: Number, default: 5 },
  order: { type: Number, default: 0 }           // To sort on the menu
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);