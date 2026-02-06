const express = require('express');
const { getSettings, syncSmartKeys, updateCronSchedule, getSystemAnalytics } = require('../controllers/settings.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeMiddleware = require('../middleware/authorize.middleware');
const router = express.Router();

router.use(authMiddleware);
router.use(authorizeMiddleware('admin'));

// Route to get the current config
router.get('/', getSettings);

// Route to process new keys automatically
router.post('/sync-keys', syncSmartKeys);

//Route to update cronjob time interval
router.post("/cron-schedule", updateCronSchedule)

//Route to get website analytical data
router.get("/analytics", getSystemAnalytics)

module.exports = router;