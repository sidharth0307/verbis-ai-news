const axios = require('axios');
const { pipeline } = require('stream/promises');
const Article = require('../models/Article');

exports.proxyArticleImage = async (req, res) => {
  try {
    const { slug, imageName } = req.params;

    // Remove file extension for flexibility (e.g., .jpg, .webp)
    const cleanImageName = imageName ? imageName.split('.')[0] : 'banner';

    // 1. Fetch the article
    const article = await Article.findOne({ slug }).select('bannerImage');

    // Determine target URL: Database link OR Cloudinary Fallback
    let targetUrl = article?.bannerImage;

    if (!targetUrl) {
      // Your specific Cloudinary fallback
      targetUrl = "https://res.cloudinary.com/dljl9dd7m/image/upload/v1767987146/Gemini_Generated_Image_n718c5n718c5n718_m4cjab.png";
    }

    // 2. Identify and Optimize Cloudinary Links
    const isCloudinary = targetUrl.includes('cloudinary.com');
    if (isCloudinary) {
      // Inject optimization parameters
      targetUrl = targetUrl.replace('/upload/', '/upload/f_auto,q_auto/');
    }

    // 3. Set Production Headers
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Vary', 'Accept');

    // 4. Stream the image
    const response = await axios({
      method: 'get',
      url: targetUrl,
      responseType: 'stream',
      timeout: 10000,
      headers: isCloudinary ? {} : {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VerbisBot/1.0',
        'Referer': new URL(targetUrl).origin
      }
    });

    // Set the correct content type from the source (GNews or Cloudinary)
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    
    await pipeline(response.data, res);

  } catch (error) {
    console.error(`[Proxy Fail] ${req.params.slug}: ${error.message}`);
    // If headers haven't been sent yet, send a 404 or a small 1x1 pixel fallback
    if (!res.headersSent) {
      res.status(404).send('Resource unavailable');
    }
  }
};