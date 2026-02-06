const settingsModel = require("../models/settingsModel");
const cloudinary = require("../config/cloudinary");
const { deleteOldAsset } = require("../utils/cloudinaryHelper");

// GET current branding assets
exports.getAssets = async (req, res) => {
  try {
    const assets = await settingsModel.findOne({ key: "model_config" })
      .select("logo siteTitle contactPhone contactEmail  fallbackBannerUrl");
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch assets" });
  }
};

// UPDATE branding assets
exports.updateAssets = async (req, res) => {
  try {
    const settings = await settingsModel.findOne({ key: "model_config" });
    const updates = {};

    //handle text fields
    const textFields = ['siteTitle', 'contactEmail', 'contactPhone'];
    textFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    //handle file/url fields
    const processField = async (fieldName, dbField) => {
      // 1. Check if a new file was uploaded
      if (req.files && req.files[fieldName]) {
        // Delete old image from Cloudinary if it exists
        if (settings && settings[dbField]) {
          await deleteOldAsset(settings[dbField]);
        }
        
        // Upload new file
        const result = await cloudinary.uploader.upload(req.files[fieldName][0].path, {
          folder: "verbis_branding",
          resource_type: "image"
        });
        updates[dbField] = result.secure_url;
      } 
      // 2. Otherwise check if a URL was provided in the body
      else if (req.body[fieldName]) {
        updates[dbField] = req.body[fieldName];
      }
    };

    await processField('logo', 'logo');
    await processField('fallbackBanner', 'fallbackBanner');

    const updated = await settingsModel.findOneAndUpdate(
      { key: "model_config" },
      { $set: updates },
      { upsert: true, new: true }
    );

    res.json({ message: "Identity & Assets updated successfully", assets: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};