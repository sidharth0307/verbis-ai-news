const cloudinary = require("../config/cloudinary");

/**
 * Extracts public_id from a Cloudinary URL safely.
 * Handles both versioned and non-versioned URLs.
 */
const getPublicId = (url) => {
  if (!url || !url.includes('cloudinary')) return null;
  
  try {
    // Splits URL by /upload/
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    // Remove the version segment (v12345678) and file extension
    const publicIdWithExt = parts[1].replace(/v\d+\//, '');
    return publicIdWithExt.split('.')[0]; 
  } catch (err) {
    console.error("Error parsing Public ID:", err);
    return null;
  }
};

/**
 * Deletes an old asset from Cloudinary to keep storage clean.
 */
const deleteOldAsset = async (url) => {
  const publicId = getPublicId(url);
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
      console.log(`Successfully deleted Cloudinary asset: ${publicId}`);
    } catch (err) {
      console.error("Cloudinary delete failed:", err.message);
    }
  }
};

/**
 * NEW: SEO-friendly Upload Helper
 * Ensures the image is stored in Cloudinary with a name that matches your article slug.
 */
const uploadSEOImage = async (fileBuffer, folder, slug) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        // This is key: It names the file in Cloudinary to match your article path
        public_id: `${slug}-banner`, 
        overwrite: true,
        unique_filename: false,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

module.exports = { deleteOldAsset, getPublicId, uploadSEOImage };