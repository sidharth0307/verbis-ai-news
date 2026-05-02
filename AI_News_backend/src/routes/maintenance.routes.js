const express = require("express");
const router = express.Router();

const settingsModel = require("../models/settingsModel");
const { runAdaptiveIngestion } = require("../utils/cronIngest");
const { runDailyNewsletter } = require("../utils/newsletterWorker");

// THE "HEARTBEAT" PULSE
// Set cron-job.org to hit this every 15 mins between 08:00 - 12:00
router.get("/pulse", async (req, res) => {
  try {
    const secret = req.query.secret;
    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = new Date();
    const currentHour = now.getHours();

    // 1. Trigger Ingestion (Always attempts during the window)
    // The runAdaptiveIngestion function already has the 8AM-12PM guard inside it.
    runAdaptiveIngestion();

    // 2. Trigger Newsletter if it's the 9 AM pulse
    if (currentHour === 9) {
      // We don't await this so the response returns fast
      runDailyNewsletter().catch(err => console.error("9AM Newsletter failed:", err));
    }

    res.json({ 
      message: "Pulse received. Systems active.",
      tasks: currentHour === 9 ? ["Ingestion", "Newsletter"] : ["Ingestion"],
      time: now.toLocaleTimeString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// THE MANUAL TRIGGER (For testing or emergency resends)
router.get("/force", async (req, res) => {
  try {
    const secret = req.query.secret;
    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fire and Forget
    runDailyNewsletter()
      .then(() => console.log("Manual newsletter dispatch completed."))
      .catch(err => console.error("Manual Newsletter failed:", err));

    res.status(202).json({ message: "Manual newsletter process initiated." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;