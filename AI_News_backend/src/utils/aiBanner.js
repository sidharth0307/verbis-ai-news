const axios = require('axios');
const settingsModel = require('../models/settingsModel');
const { addWatermarkAndLogo } = require('../services/watermark.service');

async function fetchBanner(title, slug) {
  let settings = null;
  try {
    settings = await settingsModel.findOne({}).lean();
    const provider = settings?.aiProviders?.find(p => p.name === settings.activeImageProvider && p.category === 'image');

    if (!provider) throw new Error("Image provider not configured");

    // We now include payloadStructure from your DB
    const { baseUrl, apiKey, imageModel, authHeader, payloadStructure, metadata } = provider;

    let cleanBaseUrl = baseUrl.replace(/\/$/, "");

    const metaObj = provider.metadata || {};
    const accId = metaObj.accountId || (metaObj instanceof Map ? metaObj.get('accountId') : null);

    if (accId) {
      cleanBaseUrl = cleanBaseUrl.replace("{accountId}", accId);
    }

    // 1. UNIVERSAL REQUEST BUILDER
    // Use payloadStructure instead of hardcoded .includes("cloudflare")

    // FIX: Force Cloudflare to use "isStandard = false" (Native) regardless of setting to avoid 400 errors
    const isCloudflare = cleanBaseUrl.includes("cloudflare") || provider.name?.toLowerCase().includes("cloudflare");
    const isStandard = payloadStructure === "openai" && !isCloudflare;

    // FIX: Ensure Cloudflare uses the correct Native Worker URL structure if it was configured as OpenAI
    if (isCloudflare && cleanBaseUrl.includes('/ai/v1')) {
      cleanBaseUrl = cleanBaseUrl.replace('/ai/v1', '/ai/run');
    }

    // Cloudflare-style custom APIs often put the model in the URL
    // Standard APIs (OpenRouter/OpenAI) use a fixed endpoint
    const finalUrl = isStandard
      ? `${cleanBaseUrl}/images/generations`
      : `${cleanBaseUrl}/${imageModel}`;

    const body = isStandard
      ? { model: imageModel, prompt: `Professional news photography: ${title}`, n: 1, size: "1024x1024" }
      : { prompt: `Professional news photography: ${title}` }; // Native Structure for CF/Custom

    // FIX: Robust Header Handling (Auto-correct "Bearer" to "Authorization")
    const finalAuthHeader = (authHeader === 'Bearer' || !authHeader) ? 'Authorization' : authHeader;

    const response = await axios.post(finalUrl, body, {
      headers: {
        [finalAuthHeader]: (finalAuthHeader === "Authorization" && !apiKey.startsWith('Bearer')) ? `Bearer ${apiKey}` : apiKey,
        "Content-Type": "application/json"
      },
      responseType: 'arraybuffer'
    });

    // 2. UNIVERSAL RESPONSE PARSER
    let rawSource;
    const contentType = response.headers['content-type'] || '';

    console.log(`[IMAGE DEBUG] Response Status: ${response.status}`);
    console.log(`[IMAGE DEBUG] Content-Type: ${contentType}`);
    console.log(`[IMAGE DEBUG] Data Length: ${response.data.length} bytes`);

    if (contentType.includes('image/')) {
      // This handles Cloudflare/Stability which return the raw image bits
      rawSource = Buffer.from(response.data);
    } else {
      // This handles OpenRouter/OpenAI which return a JSON with a URL
      const jsonResponse = JSON.parse(Buffer.from(response.data).toString());
      console.log(`[IMAGE DEBUG] JSON Response Keys: ${Object.keys(jsonResponse)}`);

      const url = jsonResponse.url || jsonResponse.images?.[0]?.url || jsonResponse.data?.[0]?.url || jsonResponse.result?.image;
      const b64 = jsonResponse.image || jsonResponse.images?.[0]?.b64_json || jsonResponse.data?.[0]?.b64_json || jsonResponse.result?.image;

      if (url && (url.startsWith('http') || url.startsWith('https'))) rawSource = url;
      else if (b64) rawSource = Buffer.from(b64, 'base64');
    }

    if (!rawSource) throw new Error("Image data not found in response");

    // 3. APPLY BRANDING (Slug passed for SEO)
    const finalImageUrl = await addWatermarkAndLogo(rawSource, slug);

    return {
      image: finalImageUrl,
      modelUsed: `${provider.name}/${imageModel}`
    };

  } catch (error) {
    console.error("fetchBanner Universal Error:", error.message);

    // SAFE FALLBACK: Use DB value 
    const fallback = settings?.fallbackBannerUrl;

    return { image: fallback, modelUsed: "fallback" };
  }
}

module.exports = { fetchBanner };