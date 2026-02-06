const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { createSchedule, getActiveSchedules, deleteSchedule, getAllSchedules } = require('../controllers/schedule.controller');
const authorizeMiddleware = require('../middleware/authorize.middleware');

router.use(authMiddleware);
router.use(authorizeMiddleware('admin'));

router.post('/create', createSchedule);
router.get('/active', getActiveSchedules);
router.get('/all', getAllSchedules);
router.delete('/:id', deleteSchedule);

module.exports = router;