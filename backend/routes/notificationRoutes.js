const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe, sendTestNotification, triggerReminders } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/subscribe', protect, subscribe);
router.post('/unsubscribe', protect, unsubscribe);
router.post('/test', protect, sendTestNotification);
router.get('/trigger-reminders', triggerReminders); // For Vercel Cron

module.exports = router;
