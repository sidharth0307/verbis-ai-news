const mongoose = require("mongoose");

const injectionScheduleSchema = new mongoose.Schema({
  category: { type: String, required: true },
  articlesPerDay: { type: Number, required: true }, // Max to post today
  daysRemaining: { type: Number, required: true },  // How many days left in the rule
  countToday: { type: Number, default: 0 },         // Resets at midnight
  lastRun: { type: Date, default: null },
  status: { type: String, enum: ['active', 'completed'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model("InjectionSchedule", injectionScheduleSchema);