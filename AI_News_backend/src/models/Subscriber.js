const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  isActive: { type: Boolean, default: true },
  lastSent: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Subscriber', subscriberSchema);