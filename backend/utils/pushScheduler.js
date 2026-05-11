const cron = require('node-cron');
const webpush = require('web-push');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const MedicineLog = require('../models/MedicineLog');

// Setup web-push
webpush.setVapidDetails(
    'mailto:hafizabeer15@gmail.com',
    process.env.PUBLIC_VAPID_KEY,
    process.env.PRIVATE_VAPID_KEY
);

const checkAndSendNotifications = async () => {
    console.log('Running Push Notification Check...');
    try {
        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;

        // Calculate 15 minutes from now
        const fifteenMinsLater = new Date(now.getTime() + 15 * 60000);
        const laterHours = String(fifteenMinsLater.getHours()).padStart(2, '0');
        const laterMinutes = String(fifteenMinsLater.getMinutes()).padStart(2, '0');
        const reminderTime = `${laterHours}:${laterMinutes}`;

        // 1. Check for 15-minute reminders
        const upcomingMeds = await Medicine.find({ time: reminderTime }).populate('user');
        for (const med of upcomingMeds) {
            await sendNotification(med.user, {
                title: 'Upcoming Medicine Reminder',
                body: `Don't forget to take ${med.name} (${med.dosage}) in 15 minutes.`,
                icon: '/pwa-192x192.png'
            });
        }

        // 2. Check for exact time notifications
        const exactMeds = await Medicine.find({ time: currentTime }).populate('user');
        for (const med of exactMeds) {
            await sendNotification(med.user, {
                title: 'Time for Medicine!',
                body: `It's time to take ${med.name} (${med.dosage}).`,
                icon: '/pwa-192x192.png'
            });
        }

        // 3. Check for missed medicines (5 mins after time if still pending)
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

            if (!log) {
                await sendNotification(med.user, {
                    title: 'Medicine Missed?',
                    body: `You missed your ${med.name} dose. Please take it as soon as possible.`,
                    icon: '/pwa-192x192.png'
                });
            }
        }

    } catch (error) {
        console.error('Scheduler error:', error);
    }
};

const initPushScheduler = () => {
    // Run every minute (Only works on persistent servers, not Vercel)
    cron.schedule('* * * * *', checkAndSendNotifications);
};

const sendNotification = async (user, payload) => {
    if (!user) {
        console.log('No user provided to sendNotification');
        return;
    }
    if (!user.pushSubscriptions || user.pushSubscriptions.length === 0) {
        console.log(`User ${user.name || user._id} has no push subscriptions`);
        return;
    }

    console.log(`Attempting to send notification to ${user.name} (${user.pushSubscriptions.length} devices)`);
    const notificationPayload = JSON.stringify(payload);

    const subscriptions = [...user.pushSubscriptions];
    for (const sub of subscriptions) {
        try {
            await webpush.sendNotification(sub, notificationPayload);
            console.log(`Successfully sent notification to device: ${sub.endpoint.substring(0, 30)}...`);
        } catch (error) {
            console.error(`Error sending notification to device:`, error.message);
            // If subscription is expired/invalid, remove it
            if (error.statusCode === 410 || error.statusCode === 404) {
                console.log('Subscription expired, removing...');
                user.pushSubscriptions = user.pushSubscriptions.filter(s => s.endpoint !== sub.endpoint);
                await user.save();
            }
        }
    }
};

module.exports = { initPushScheduler, checkAndSendNotifications };
