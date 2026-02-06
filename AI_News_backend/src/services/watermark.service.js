const sharp = require("sharp");
const axios = require("axios");
const settingsModel = require("../models/settingsModel");
const { uploadSEOImage } = require("../utils/cloudinaryHelper");

// Your specific Cloudinary backups
const FALLBACK_BANNER = "https://res.cloudinary.com/dljl9dd7m/image/upload/v1767987146/Gemini_Generated_Image_n718c5n718c5n718_m4cjab.png";
const FALLBACK_LOGO = "https://res.cloudinary.com/dljl9dd7m/image/upload/v1769272447/verbis_branding/nujf8q6gphg0v0yfuzam.png";

async function fetchImageWithFallback(input, secondaryUrl) {
  if (input && Buffer.isBuffer(input)) return input;

  // Try the provided URL first, then the secondary/backup URL
  const urls = [input, secondaryUrl].filter(url => typeof url === 'string' && url.startsWith('http'));

  for (const url of urls) {
    try {
      const response = await axios({
        url,
        responseType: "arraybuffer",
        timeout: 10000,
        headers: {
          // This makes the request look like a real browser to avoid blocks
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        }
      });
      return Buffer.from(response.data);
    } catch (err) {
      console.warn(`Fallback: Failed to grab ${url.substring(0, 40)}... trying next.`);
    }
  }
  return null; 
}

async function addWatermarkAndLogo(imageUrl, slug) {
  let settings;
  try {
    settings = await settingsModel.findOne({ key: "model_config" }).lean();
    const siteTitle = settings?.siteTitle || 'VERBIS AI';

    // 1. Resolve Banner (News Image -> Settings Fallback -> Cloudinary Fallback)
    let bannerBuffer = await fetchImageWithFallback(imageUrl, settings?.fallbackBannerUrl);
    if (!bannerBuffer) {
      bannerBuffer = await fetchImageWithFallback(FALLBACK_BANNER);
    }

    // 2. Resolve Logo (Settings Logo -> Cloudinary Logo Fallback)
    const logoBuffer = await fetchImageWithFallback(settings?.logo, FALLBACK_LOGO);

    const layers = [];

    // 3. Add Logo layer (if we have a logo)
    if (logoBuffer) {
      try {
        const resizedLogo = await sharp(logoBuffer).resize(180).toBuffer();
        layers.push({ input: resizedLogo, gravity: 'southeast' });
      } catch (e) {
        console.warn("Logo broken, skipping logo layer.");
      }
    }

    // 4. Add Text Watermark
    layers.push({
      input: Buffer.from(`
        <svg width="400" height="60">
          <text x="10" y="40" font-family="Arial" font-weight="bold" font-size="24" fill="white" fill-opacity="0.3">
            ${siteTitle}
          </text>
        </svg>`),
      gravity: 'southwest'
    });

    // 5. Sharp Processing
    const processedBuffer = await sharp(bannerBuffer)
      .resize(1200, 675, { fit: 'cover' })
      .composite(layers)
      .jpeg({ quality: 85 })
      .toBuffer();

    console.log(`Uploading SEO Image: ${slug}-banner`);
    const uploadResult = await uploadSEOImage(processedBuffer, "verbis_news/articles", slug);

    return uploadResult.secure_url;

  } catch (error) {
    console.error("CRITICAL: Image Pipeline Failed:", error.message);
    // If everything fails, return the Cloudinary backup URL as a string
    return FALLBACK_BANNER;
  }
}

module.exports = { addWatermarkAndLogo };