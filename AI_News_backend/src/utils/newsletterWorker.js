const Article = require("../models/Article");
const Subscriber = require("../models/Subscriber");
const User = require("../models/User");
const { generateNewsletterHTML, generateDigestHTML } = require("./emailTemplates");
const { sendMail } = require("./mailer");
const cron = require("node-cron");

const getDailyDigestContent = async () => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Fetch the top 8 articles from the last 24 hours
  // We sort by views or likes to give them the "most relevant" content
  return await Article.find({
    publishedAt: { $gte: yesterday },
    isPurged: false
  })
    .sort({ views: -1, publishedAt: -1 }) // Prioritize popular news, then newest
    .limit(8)
    .select("title summary slug category bannerImage")
    .lean();
};


const runDailyNewsletter = async () => {
  try {
    const topArticles = await getDailyDigestContent();
    
    if (topArticles.length === 0) {
      console.log("No new articles to send today.");
      return;
    }

    const cursor = Subscriber.find({ isActive: true }).cursor();

    for (let sub = await cursor.next(); sub != null; sub = await cursor.next()) {
      // Check if user already got a mail today (prevents duplicates on server restart)
      const today = new Date().setHours(0,0,0,0);
      if (sub.lastSent && sub.lastSent >= today) continue;

      const userAccount = await User.findOne({ email: sub.email }).select("name");
      const displayName = userAccount ? userAccount.name : "Reader";

      const html = generateDigestHTML(displayName, topArticles);
      
      await sendMail(sub.email, "The Verbis AI Daily Edition", html);
      
      // Mark as sent
      await Subscriber.updateOne({ _id: sub._id }, { lastSent: new Date() });
      
      // 1-second delay to be kind to Gmail's SMTP
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (err) {
    console.error("Newsletter Error:", err);
  }
};

// Schedule: Runs every day at 9:00 AM IST
cron.schedule("0 9 * * *", () => {
  console.log("Triggering Daily Newsletter...");
  runDailyNewsletter();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

module.exports = { runDailyNewsletter };