const User = require('../models/User');

// @desc    Subscribe to push notifications
// @route   POST /api/notifications/subscribe
// @access  Private
exports.subscribe = async (req, res) => {
    try {
        const subscription = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if subscription already exists
        const exists = user.pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint);

        if (!exists) {
            user.pushSubscriptions.push(subscription);
            await user.save();
        }

        res.status(201).json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Unsubscribe from push notifications
// @route   POST /api/notifications/unsubscribe
// @access  Private
exports.unsubscribe = async (req, res) => {
    try {
        const { endpoint } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.pushSubscriptions = user.pushSubscriptions.filter(sub => sub.endpoint !== endpoint);
        await user.save();

        res.status(200).json({ success: true, message: 'Unsubscribed successfully' });
    } catch (error) {
        console.error('Unsubscription error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
