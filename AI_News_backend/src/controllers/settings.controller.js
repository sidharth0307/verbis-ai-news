const Groq = require('groq-sdk');
const settingsModel = require('../models/settingsModel');
const { initializeScheduledTasks } = require('../utils/cronIngest');
const Article = require('../models/Article');
const InjectionScheduleModel = require('../models/InjectionScheduleModel');
const User = require('../models/User');
const { getRedis } = require('../config/redis');

// The Master Groq instance using your private server key
const masterGroq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * MASTER ANALYZER FUNCTION
 * Uses Groq to "sniff" the API key and return configuration
 */
const analyzeKeyWithAI = async (keyString, type) => {
  if (keyString.startsWith('ai_')) {
    return {
      provider: "Google AI Studio",
      // Using Native REST API to avoid OpenAI-compat issues
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      protocol: "google",

      // Map models based on category
      availableModels: type === 'text'
        ? ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"]
        : ["gemini-1.5-flash"], // Gemini doesn't separate image models cleanly in the same way, but 1.5-flash handles both

      selectedModel: "gemini-1.5-flash",
      fallbackModel: "gemini-1.5-flash",
      cleanKey: keyString.trim(),
      authHeader: "x-goog-api-key", // Not used in URL-param auth but good to have
      authPrefix: ""
    };
  }
  if (keyString.includes(':')) {
    const [accountId, token] = keyString.split(':');
    if (accountId.length >= 32) { // Cloudflare IDs are 32 chars
      return {
        provider: "Cloudflare",
        baseUrl: `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1`,
        protocol: "openai", // Cloudflare Workers AI is OpenAI-compatible
        availableModels: type === 'image'
          ? ["@cf/black-forest-labs/flux-1-schnell", "@cf/stabilityai/stable-diffusion-xl-base-1.0"]
          : ["@cf/meta/llama-3.1-8b-instruct", "@cf/mistral/mistral-7b-instruct-v0.3"],
        selectedModel: type === 'image' ? "@cf/black-forest-labs/flux-1-schnell" : "@cf/meta/llama-3.1-8b-instruct",
        cleanKey: token.trim(),
        accountId: accountId.trim(),
        authHeader: "Authorization",
        authPrefix: "Bearer"
      };
    }
  }
  const prompt = `
    TASK: Analyze the provided API Key: "${keyString}"
    TYPE: ${type} (Text or Image)

    GOAL: 
    1. Identify the most likely provider.
    2. Suggest 4 compatible model IDs (from high-end to fast-lite) specifically for the TYPE: ${type}.
    3. Determine the correct Base URL and Auth Protocol.

   STRICT IDENTIFICATION RULES (Do not deviate from specific provider/url, but ADAPT MODELS to TYPE):
    1. If starts with "gsk_": Provider "Groq", URL "https://api.groq.com/openai/v1".
       - Text Models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]
       - Image Models (if applicable): ["flux-1-schnell-free"] (Note: generic placeholder if none exist)
    2. If starts with "sk-or-": Provider "OpenRouter", URL "https://openrouter.ai/api/v1".
       - Text Models: ["google/gemini-2.0-flash-001", "anthropic/claude-3.5-sonnet", "deepseek/deepseek-chat"]
       - Image Models: ["stabilityai/stable-diffusion-xl-base-1.0", "black-forest-labs/flux-1-schnell", "google/gemini-2.0-flash-001"]
    3. If starts with "sk-ant-": Provider "Anthropic", URL "https://api.anthropic.com/v1", Protocol "anthropic".
    4. If contains ":" and looks like cloudflare: Provider "Cloudflare", URL "https://api.cloudflare.com/client/v4/accounts/{accountId}/ai/v1", Extract accountId before ":" and token after ":".
    5. If starts with "sk-" (and not OpenRouter/Anthropic): Provider "OpenAI", URL "https://api.openai.com/v1". 
       - Text Models: ["gpt-4o", "gpt-4o-mini", "o1-preview"]
       - Image Models: ["dall-e-3", "dall-e-2"]
    6. If starts with "ai_": Provider "Google Gemini", URL "https://generativelanguage.googleapis.com/v1beta/openai", Models ["gemini-2.0-flash", "gemini-1.5-pro"].
    
    Return ONLY JSON:
    {
      "provider": "String",
      "baseUrl": "String",
      "protocol": "openai | anthropic | custom",
      "availableModels": ["Model ID 1", "Model ID 2", "Model ID 3", "Model ID 4"],
      "selectedModel": "Best overall default for the requested TYPE",
      "fallbackModel": "Most stable/cheapest",
      "accountId": "Required if Cloudflare",
      "cleanKey": "The full token required for the Bearer header (strip AccountID if CF)",
      "cleanKey": "The full token required for the Bearer header (strip AccountID if CF)",
      "authHeader": "Authorization", 
      "authPrefix": "Bearer"
    }
  `;

  try {
    const chatCompletion = await masterGroq.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });
    return JSON.parse(chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error("Forensic Analysis Failed:", error);
    throw new Error("AI could not determine provider for this key.")
  }
};

/**
 * GET SETTINGS
 * Retrieves the current site configuration and AI pool
 */
exports.getSettings = async (req, res) => {
  try {
    // We look for the document with our unique key
    const settings = await settingsModel.findOne(
      { key: "model_config" }, {
      siteTitle: 0,
      contactEmail: 0,
      contactPhone: 0,
      logo: 0,
      fallbackBannerUrl: 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0
    });

    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    // Convert Mongoose document to plain JSON 
    // This ensures 'Maps' (metadata) are converted to standard objects
    const settingsData = settings.toObject();

    res.status(200).json(settingsData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching settings", error: error.message });
  }
};

/**
 * SYNC SMART KEYS CONTROLLER
 * Triggered by the frontend "Sync Intelligence" button
 */
exports.syncSmartKeys = async (req, res) => {
  const { textKey, imageKey } = req.body;

  try {
    // 1. Analyze keys in parallel
    const [textResult, imageResult] = await Promise.all([
      analyzeKeyWithAI(textKey, 'text'),
      analyzeKeyWithAI(imageKey || textKey, 'image')
    ]);

    const providers = [];

    // --- TEXT PROVIDER MAPPING ---
    if (textResult) {
      providers.push({
        name: textResult.provider || textResult.name,
        baseUrl: textResult.baseUrl,
        apiKey: textResult.cleanKey,
        payloadStructure: textResult.protocol || 'openai', // openai, anthropic, etc.

        // ACTIVE SELECTION
        textModel: textResult.selectedModel,

        // ROBUSTNESS ARRAYS (Crucial for your dropdowns)
        availableTextModels: textResult.availableModels || [],
        fallbackTextModel: textResult.fallbackModel || (textResult.availableModels && textResult.availableModels.length > 0 ? textResult.availableModels[textResult.availableModels.length - 1] : "gpt-3.5-turbo"),

        authHeader: 'Authorization',
        authPrefix: textResult.authHeader?.includes('Bearer') ? 'Bearer' : '',
        category: 'text',
        metadata: textResult.accountId ? { accountId: textResult.accountId } : {}
      });
    }

    // --- IMAGE PROVIDER MAPPING ---
    if (imageResult) {
      const isCf = imageResult.provider?.toLowerCase().includes('cloudflare') ||
        imageResult.baseUrl?.includes('cloudflare');

      const isGoogle = imageResult.provider?.toLowerCase().includes('google') ||
        imageResult.cleanKey?.startsWith('ai_');

      const rawId = imageResult.accountId || imageResult.accountID;

      providers.push({
        // Dynamic naming based on fingerprinting
        name: isCf ? "Cloudflare" : (isGoogle ? "Google AI Studio" : (imageResult.provider || imageResult.name || "Custom Image")),

        // URL MAPPING:
        // Cloudflare needs the accountId in the path.
        // Google uses the v1beta/openai endpoint for compatibility.
        baseUrl: isCf
          ? `https://api.cloudflare.com/client/v4/accounts/${rawId}/ai/v1`
          : isGoogle
            ? "https://generativelanguage.googleapis.com/v1beta/openai"
            : imageResult.baseUrl,

        apiKey: imageResult.cleanKey,
        protocol: (isCf || isGoogle) ? "openai" : imageResult.protocol,

        // ACTIVE SELECTION
        // If it's Google, we ensure it uses the Nano Banana model (gemini-2.5-flash-image)
        imageModel: imageResult.selectedModel,

        // ROBUSTNESS ARRAYS
        availableImageModels: imageResult.availableModels || [],
        fallbackImageModel: imageResult.fallbackModel || (isCf ? "@cf/bytedance/stable-diffusion-xl-lightning" : "stabilityai/stable-diffusion-xl-base-1.0"),

        category: 'image',
        metadata: {
          ...(rawId && { accountId: String(rawId) }),
          ...(isGoogle && { variant: "Nano Banana" }) // Marker for frontend UI badges
        }
      });
    }

    // Define the final names first so the "Active" pointers match the "Array" entries exactly
    const finalTextName = textResult?.provider || textResult?.name || "";

    let finalImageName = "";
    if (imageResult) {
      const isCf = imageResult.provider?.toLowerCase().includes('cloudflare') || imageResult.baseUrl?.includes('cloudflare');
      const isGoogle = imageResult.cleanKey?.startsWith('ai_');
      finalImageName = isCf ? "Cloudflare" : (isGoogle ? "Google AI Studio" : (imageResult.provider || imageResult.name || "Custom Image"));
    }

    // 3. Update Settings
    const updatedSettings = await settingsModel.findOneAndUpdate(
      { key: "model_config" },
      {
        $set: {
          aiProviders: providers,
          activeTextProvider: finalTextName,
          activeImageProvider: finalImageName // Matches the 'name' field in your array
        }
      },
      { upsert: true, new: true }
    ).lean();

    res.status(200).json({
      message: "AI Intelligence Synced",
      providers: updatedSettings.aiProviders, // Send back the full array for the UI
      activeTextProvider: updatedSettings.activeTextProvider,
      activeImageProvider: updatedSettings.activeImageProvider
    });

  } catch (error) {
    res.status(500).json({ message: "Sync Error", error: error.message });
  }
};

exports.updateCronSchedule = async (req, res) => {
  try {
    const { intervalMinutes, articleExpiryDays } = req.body;

    // 1. Validation: Force a minimum of 15 minutes
    const interval = parseInt(intervalMinutes);

    if (isNaN(interval) || interval < 15) {
      return res.status(400).json({
        success: false,
        message: "For system stability, the ingestion interval must be at least 15 minutes."
      });
    }

    // 2. Convert integer (e.g., 30) to Cron String (e.g., "*/30 * * * *")
    // If interval is 60 or more, we might want to use "0 */x" format, 
    // but for simplicity, "*/x" works for most node-cron versions.
    const newCronString = `*/${interval} * * * *`;

    const updatedSettings = await settingsModel.findOneAndUpdate(
      { key: "model_config" },
      {
        $set: {
          cronSchedule: newCronString,
          articleExpiryDays
        }
      },
      { new: true, upsert: true }
    );

    try {
      await initializeScheduledTasks();
    } catch (cronError) {
      return res.status(207).json({ // 207 = Multi-Status (Saved but task failed)
        success: true,
        message: "Settings saved, but the background task failed to restart. Please check server logs.",
        data: updatedSettings
      });
    }

    res.status(200).json({
      success: true,
      message: `System updated. Next ingestion run scheduled for every ${interval} minutes.`,
      data: {
        interval: interval,
        cronString: updatedSettings.cronSchedule,
        expiryDays: updatedSettings.articleExpiryDays
      }
    });
  } catch (error) {
    console.error("Update Settings Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update settings.",
      error: error.message
    });
  }
}


exports.getSystemAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));

    // Execute all database queries in parallel
    const [
      totalUsers,
      newUsersToday,
      engagementStats,
      contentStats,
      categoryStats,
      topArticles, // Added correctly here
      activeRules
    ] = await Promise.all([
      // 1. User Totals
      User.countDocuments({ role: "user" }),

      // 2. New Users Today
      User.countDocuments({
        role: "user",
        createdAt: { $gte: startOfToday }
      }),

      // 3. Average Engagement
      User.aggregate([
        { $match: { role: "user" } },
        {
          $group: {
            _id: null,
            avgSaved: { $avg: { $size: { $ifNull: ["$savedArticles", []] } } },
            avgLiked: { $avg: { $size: { $ifNull: ["$likedArticles", []] } } }
          }
        }
      ]),

      // 4. Content & Views
      Article.aggregate([
        {
          $group: {
            _id: null,
            totalArticles: { $sum: 1 },
            totalViews: { $sum: { $ifNull: ["$views", 0] } },
            todayArticles: {
              $sum: { $cond: [{ $gte: ["$createdAt", startOfToday] }, 1, 0] }
            }
          }
        }
      ]),

      // 5. Category Distribution & Ranking
      Article.aggregate([
        {
          $group: {
            _id: "$category",
            articleCount: { $sum: 1 },
            totalViews: { $sum: { $ifNull: ["$views", 0] } }
          }
        },
        { $sort: { totalViews: -1 } },
        { $project: { name: "$_id", totalViews: 1, articleCount: 1, _id: 0 } }
      ]),

      // 6. Top 10 Articles
      Article.find({}, { title: 1, views: 1, category: 1 })
        .sort({ views: -1 })
        .limit(10)
        .lean(),

      // 7. Operational Health
      InjectionScheduleModel.find({ status: "active" })
    ]);

    const contentData = contentStats[0] || { totalArticles: 0, totalViews: 0, todayArticles: 0 };

    const contentWeighting = categoryStats.map(cat => ({
      name: cat.name || "Uncategorized",
      value: cat.articleCount,
      percentage: ((cat.articleCount / contentData.totalArticles) * 100).toFixed(1),
      views: cat.totalViews
    }));

    const analyticsResult = {
      success: true,
      data: {
        users: {
          total: totalUsers,
          today: newUsersToday,
          engagement: engagementStats[0] || { avgSaved: 0, avgLiked: 0 }
        },
        content: {
          total: contentData.totalArticles,
          today: contentData.todayArticles,
          totalViews: contentData.totalViews,
          topArticles: topArticles.map(a => ({
            label: a.title.length > 20 ? a.title.substring(0, 20) + "..." : a.title,
            views: a.views || 0,
            category: a.category
          })),
          categoryRanking: categoryStats,
          contentWeighting: contentWeighting
        },
        ingestion: {
          activeRulesCount: activeRules.length,
          rules: activeRules.map(rule => ({
            category: rule.category,
            current: rule.countToday,
            total: rule.articlesPerDay,
            percentage: ((rule.countToday / rule.articlesPerDay) * 100).toFixed(1)
          }))
        }
      }
    };

    res.status(200).json(analyticsResult);

  } catch (error) {
    console.error("Analytics Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};