const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe, sendTestNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/subscribe', protect, subscribe);
router.post('/unsubscribe', protect, unsubscribe);
router.post('/test', protect, sendTestNotification);

module.exports = router;
