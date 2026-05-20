const express = require("express");
const router = express.Router();

const settingsModel = require("../models/settingsModel");
const { runAdaptiveIngestion } = require("../utils/cronIngest");
const { runDailyNewsletter } = require("../utils/newsletterWorker");

// THE "HEARTBEAT" PULSE
// cron-job.org to hit this every 15 mins between 08:00 - 12:00
router.get("/pulse", async (req, res) => {
  try {
    const secret = req.query.secret;
    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hourCycle: 'h23'
    });
    const currentHour = parseInt(formatter.format(now), 10);

    // Trigger Newsletter if it's the 9 AM pulse
    if (currentHour === 9) {
      console.log("External Pulse: Triggering 9 AM Newsletter dispatch...")
      runDailyNewsletter().catch(err => console.error("9AM Newsletter failed:", err));
    }

    res.json({ 
      message: "Pulse received. Systems active.",
      tasks: currentHour === 9 ? ["Newsletter"] : ["Heartbeat Only"],
      time: now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' }),
      serverHourUTC: now.getHours(),
      calculatedHourIST: currentHour
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// THE MANUAL TRIGGER (For testing)
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