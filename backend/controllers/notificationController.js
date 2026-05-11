const User = require('../models/User');
const Medicine = require('../models/Medicine');
const MedicineLog = require('../models/MedicineLog');
const { sendFCMNotification } = require('../utils/fcm');

// @desc    Trigger reminders manually (for Vercel Cron)
// @route   GET /api/notifications/trigger-reminders
// @access  Public
exports.triggerReminders = async (req, res) => {
    try {
        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;

        // 1. Exact Time Reminders
        const exactMeds = await Medicine.find({ time: currentTime }).populate('user');
        for (const med of exactMeds) {
            if (med.user && med.user.fcmTokens.length > 0) {
                await sendFCMNotification(med.user.fcmTokens, {
                    title: 'Time for Medicine!',
                    body: `It's time to take ${med.name} (${med.dosage}).`,
                });
            }
        }

        // 2. Missed Dose Logic (Example: 5 mins later)
        // ... (Similar to before but using sendFCMNotification)

        res.status(200).json({ success: true, message: 'FCM Reminders triggered' });
    } catch (error) {
        console.error('Trigger error:', error);
        res.status(500).json({ success: false, message: 'Trigger failed' });
    }
};

// @desc    Send test FCM notification
// @route   POST /api/notifications/test
// @access  Private
exports.sendTestNotification = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
            return res.status(400).json({ success: false, message: 'No FCM tokens found' });
        }

        await sendFCMNotification(user.fcmTokens, {
            title: 'FCM Test Notification',
            body: 'Mubarak ho! FCM notifications sahi kaam kar rahi hain. ✅',
        });

        res.status(200).json({ success: true, message: 'Test notification sent via FCM' });
    } catch (error) {
        console.error('Test notification error:', error);
        res.status(500).json({ success: false, message: 'Failed to send FCM test' });
    }
};

// @desc    Subscribe to FCM notifications
// @route   POST /api/notifications/subscribe
// @access  Private
exports.subscribe = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.fcmTokens.includes(token)) {
            user.fcmTokens.push(token);
            await user.save();
        }

        res.status(201).json({ success: true, message: 'Subscribed to FCM successfully' });
    } catch (error) {
        console.error('FCM Subscription error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Unsubscribe from FCM notifications
// @route   POST /api/notifications/unsubscribe
// @access  Private
exports.unsubscribe = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.fcmTokens = user.fcmTokens.filter(t => t !== token);
        await user.save();

        res.status(200).json({ success: true, message: 'Unsubscribed from FCM successfully' });
    } catch (error) {
        console.error('FCM Unsubscription error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
