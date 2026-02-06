const cron = require("node-cron");
const Article = require("../models/Article");
const { fetchRawNews } = require("./fetchRawNews");
const { processNewsWithAI } = require("../services/newsAI.service");
const { getRedis } = require("../config/redis");
const { addWatermarkAndLogo } = require("../services/watermark.service");
const cloudinary = require("../config/cloudinary");
const InjectionScheduleModel = require("../models/InjectionScheduleModel");
const { getPublicId } = require("./cloudinaryHelper");
const slugify = require("slugify");
const settingsModel = require("../models/settingsModel");
const CategoryModel = require("../models/CategoryModel");

/**
 * Cleanup function to remove images from Cloudinary for articles 
 */
async function cleanupCloudinaryStorage() {
  try {
    const settings = await settingsModel.findOne({ key: "model_config" });

    // 1. Calculate how often the cron runs (in minutes)
    // If schedule is '*/30 * * * *', interval is 30. If '0 * * * *', interval is 60.
    const cronInterval = settings.cronSchedule.includes('/')
      ? parseInt(settings.cronSchedule.split('/')[1])
      : 60;

    // 2. Set the buffer to be 1.5x the cron interval (in milliseconds)
    // This ensures we always catch articles expiring before the NEXT cron run.
    const bufferMs = cronInterval * 60 * 1000 * 1.5;
    const lookAheadWindow = new Date(Date.now() + bufferMs);

    // 3. Find articles expiring within this adaptive window
    const expiringSoon = await Article.find({
      expiresAt: { $lt: lookAheadWindow },
      isPurged: { $ne: true }
    }).select("bannerImage cloudinaryPublicId");

    if (expiringSoon.length === 0) return;

    // ... Proceed with Cloudinary deletion and setting isPurged: true ...
    console.log(`Adaptive Cleanup: Purging ${expiringSoon.length} assets based on ${cronInterval}min interval.`);
    const deletePromises = expiringSoon.map(async (article) => {
      const publicId = article.cloudinaryPublicId || getPublicId(article.bannerImage);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
      return article._id;
    });

    const purgedIds = await Promise.all(deletePromises);

    if (purgedIds.length > 0) {
      await Article.updateMany(
        { _id: { $in: purgedIds } },
        { $set: { isPurged: true } }
      );
    }

  } catch (err) {
    console.error("Adaptive Cleanup Error:", err);
  }
}

// Add this helper to your AI Service or at the top of the file
async function generateSearchQuery(categoryName) {
  try {
    // We use a small, fast prompt to get keywords
    const prompt = `Act as a news SEO expert. Convert the category "${categoryName}" into a GNews API search query. 
    Use Boolean operators (OR) and quotes. Keep it under 5 words. 
    Example Input: "THE AI LIFE" -> Output: ChatGPT OR "Artificial Intelligence" OR Robotics
    Example Input: "WORK 2.0" -> Output: "Remote Work" OR "Future of Work" OR Automation
    Output only the query string.`;

    const result = await processNewsWithAI(prompt); // Reusing your existing AI service
    // Ensure we strip any accidental quotes or "Output:" text
    return result.title.replace(/["']/g, "");
  } catch (err) {
    return categoryName; // Fallback to category name if AI fails
  }
}

/**
 * TASK 1: ADAPTIVE INGESTION CRON
 * Dynamically adjusts batch size based on cron frequency and remaining daily quota.
 */
/**
 * Helper to create a delay between API calls
 */
/**
 * Global Lock to prevent multiple cron instances from running simultaneously
 */
let isIngesting = false;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * AI Query Architect: Converts abstract categories into GNews-friendly queries
 */
async function generateSearchQuery(categoryName) {
  try {
    const prompt = `Act as a news SEO expert. Convert the category "${categoryName}" into a GNews API search query. 
    Use Boolean operators (OR) and quotes for phrases. Keep it under 5 words. 
    Example Input: "THE AI LIFE" -> Output: ChatGPT OR "Artificial Intelligence" OR Robotics
    Example Input: "WORK 2.0" -> Output: "Remote Work" OR "Future of Work" OR Automation
    Return ONLY the query string.`;

    const aiResult = await processNewsWithAI(prompt);
    // Note: ensure we use the text content from your specific AI result object
    let query = (aiResult.title || aiResult.rewrittenContent || "").replace(/["']/g, "").trim();

    return query || categoryName;
  } catch (err) {
    console.error("AI Query Gen Failed, using fallback:", err.message);
    return categoryName;
  }
}

const runAdaptiveIngestion = async () => {
  // 1. Prevent overlapping runs
  if (isIngesting) {
    console.log(" Ingestion blocked: Previous cycle still active.");
    return;
  }

  const now = new Date();
  console.log("--- Starting Smart Parallel Adaptive Ingestion ---");
  isIngesting = true;

  try {
    const settings = await settingsModel.findOne({ key: "model_config" });
    const cronSchedule = settings?.cronSchedule || "*/30 * * * *";
    const cronInterval = cronSchedule.includes('/') ? parseInt(cronSchedule.split('/')[1]) : 60;

    await cleanupCloudinaryStorage();

    const activeRules = await InjectionScheduleModel.find({
      status: 'active',
      daysRemaining: { $gt: 0 },
      $expr: { $lt: ["$countToday", "$articlesPerDay"] }
    });

    if (activeRules.length === 0) {
      console.log("System Idle: All daily limits reached.");
      return;
    }

    let totalSavedInCycle = 0;

    for (const rule of activeRules) {
      try {
        // --- STEP A: AI EXPANDS THE CATEGORY ---
        console.log(` AI is architecting query for: ${rule.category}`);
        const masterCategory = await CategoryModel.findOne({ name: rule.category });
        const categorySlug = masterCategory ? masterCategory.slug : "general";
        // Use the custom searchQuery if it exists in DB, otherwise use AI expansion
        const expandedQuery = masterCategory?.searchQuery || await generateSearchQuery(rule.category);
        console.log(` GNews Query: ${expandedQuery}`);

        // --- STEP B: ADAPTIVE MATH ---
        const totalRemainingToday = rule.articlesPerDay - rule.countToday;
        const minutesLeftInDay = 1440 - (now.getHours() * 60 + now.getMinutes());
        const remainingRuns = Math.max(1, Math.floor(minutesLeftInDay / cronInterval));
        const batchSize = Math.ceil(totalRemainingToday / remainingRuns);

        // --- STEP C: FETCH ---
        const rawArticles = await fetchRawNews(expandedQuery);

        if (!rawArticles?.length) {
          console.log(`No results for ${expandedQuery}. Skipping.`);
          continue;
        }

        let ruleSavedCount = 0;
        for (const news of rawArticles) {
          if (ruleSavedCount >= batchSize) break;

          const exists = await Article.findOne({ url: news.url });
          if (exists) continue;

          // AI Rewrite & Image processing
          const aiResult = await processNewsWithAI(news.content || news.description);
          let slug = slugify(aiResult.title, { lower: true, strict: true });
          if (slug.length > 100) slug = slug.substring(0, 100);

          const bannerImageUrl = await addWatermarkAndLogo(news.image, slug);
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + (settings.articleExpiryDays || 7));

          await Article.create({
            title: aiResult.title,
            slug,
            seoKeywords: aiResult.seoKeywords,
            modelUsed: aiResult.modelUsed,
            aiContent: aiResult.rewrittenContent,
            summary: aiResult.summary,
            category: rule.category,
            categorySlug: categorySlug,
            url: news.url,
            bannerImage: bannerImageUrl,
            expiresAt: expiryDate,
            source: { name: news.source?.name || "Verbis AI", url: news.url }
          });

          rule.countToday += 1;
          ruleSavedCount += 1;
          totalSavedInCycle += 1;
        }

        rule.lastRun = now;
        await rule.save();

        // --- STEP D: RATE LIMIT PROTECTION ---
        console.log(` ${rule.category} complete. Staggering 10s...`);
        await sleep(10000); // 10-second sleep is safer for GNews free tier

      } catch (ruleErr) {
        console.error(`Rule Error (${rule.category}):`, ruleErr.message);
      }
    }

    const redis = getRedis();
    if (totalSavedInCycle > 0 && redis) {
      const keys = await redis.keys("articles:*");
      if (keys.length > 0) await redis.del(...keys);
    }

  } catch (err) {
    console.error("Critical Ingestion Error:", err.message);
  } finally {
    // 2. Always unlock
    isIngesting = false;
    console.log("--- Ingestion Cycle Finished & Unlocked ---");
  }
};

/**
 * DYNAMIC CRON MANAGER
 */
let ingestionTask = null;

const initializeScheduledTasks = async () => {
  try {
    const settings = await settingsModel.findOne({ key: "model_config" });
    const schedule = settings?.cronSchedule || "*/30 * * * *";

    if (ingestionTask) ingestionTask.stop();
    ingestionTask = cron.schedule(schedule, runAdaptiveIngestion);

    console.log(` Adaptive Cron initialized: ${schedule}`);
  } catch (err) {
    console.error("Cron Init Error:", err.message);
  }
};

initializeScheduledTasks();

/**
 * TASK 2: MIDNIGHT RESETTER (00:00 Every Day)
 * Renews the daily budget and decrements the duration.
 */
cron.schedule("0 0 * * *", async () => {
  console.log(" Midnight Reset: Updating Injection Cycles...");

  try {
    const activeRules = await InjectionScheduleModel.find({ status: 'active' });

    for (const rule of activeRules) {
      rule.countToday = 0;      // Reset daily budget
      rule.daysRemaining -= 1;  // One day consumed

      if (rule.daysRemaining <= 0) {
        rule.status = 'completed';
      }
      await rule.save();
    }
    console.log("All daily quotas reset.");
  } catch (err) {
    console.error("Midnight reset error:", err.message);
  }
});

module.exports = {
  initializeScheduledTasks,
  runAdaptiveIngestion,
  cleanupCloudinaryStorage
};