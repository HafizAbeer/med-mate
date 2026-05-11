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
        // Vercel server might be in UTC, so we should consider timezone or use a simple HH:mm check
        // For now, assuming server time is what user expects or adjusted
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;

        // Calculate 15 minutes from now
        const fifteenMinsLater = new Date(now.getTime() + 15 * 60000);
        const laterHours = String(fifteenMinsLater.getHours()).padStart(2, '0');
        const laterMinutes = String(fifteenMinsLater.getMinutes()).padStart(2, '0');
        const reminderTime = `${laterHours}:${laterMinutes}`;

        console.log(`Checking reminders for Time: ${currentTime}, ReminderTime: ${reminderTime}`);

        // 1. Exact Time Reminders
        const exactMeds = await Medicine.find({ time: currentTime }).populate('user');
        for (const med of exactMeds) {
            if (med.user && med.user.fcmTokens && med.user.fcmTokens.length > 0) {
                await sendFCMNotification(med.user.fcmTokens, {
                    title: 'Time for Medicine!',
                    body: `It's time to take ${med.name} (${med.dosage}).`,
                });
            }
        }

        // 2. 15-Minute Before Reminders
        const upcomingMeds = await Medicine.find({ time: reminderTime }).populate('user');
        for (const med of upcomingMeds) {
            if (med.user && med.user.fcmTokens && med.user.fcmTokens.length > 0) {
                await sendFCMNotification(med.user.fcmTokens, {
                    title: 'Upcoming Medicine Reminder',
                    body: `Don't forget to take ${med.name} (${med.dosage}) in 15 minutes.`,
                });
            }
        }

        // 3. Missed Dose Check (5 mins after time)
        const fiveMinsAgo = new Date(now.getTime() - 5 * 60000);
        const pastHours = String(fiveMinsAgo.getHours()).padStart(2, '0');
        const pastMinutes = String(fiveMinsAgo.getMinutes()).padStart(2, '0');
        const missedTime = `${pastHours}:${pastMinutes}`;

        const potentiallyMissed = await Medicine.find({ time: missedTime }).populate('user');
        for (const med of potentiallyMissed) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const log = await MedicineLog.findOne({
                $or: [{ medicine: med._id }, { medicineName: med.name }],
                user: med.user._id,
                date: { $gte: today }
            });

            if (!log && med.user && med.user.fcmTokens && med.user.fcmTokens.length > 0) {
                await sendFCMNotification(med.user.fcmTokens, {
                    title: 'Medicine Missed?',
                    body: `You missed your ${med.name} dose. Please take it as soon as possible.`,
                });
            }
        }

        res.status(200).json({ success: true, message: 'FCM Reminders processed' });
    } catch (error) {
        console.error('Trigger error:', error);
        res.status(500).json({ success: false, message: 'Trigger failed' });
    }
};

// ... (Rest of the controller functions: sendTestNotification, subscribe, unsubscribe)
// I'll rewrite them to ensure the whole file is updated correctly.

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

exports.subscribe = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (!user.fcmTokens.includes(token)) {
            user.fcmTokens.push(token);
            await user.save();
        }
        res.status(201).json({ success: true, message: 'Subscribed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.unsubscribe = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.fcmTokens = user.fcmTokens.filter(t => t !== token);
        await user.save();
        res.status(200).json({ success: true, message: 'Unsubscribed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
