const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add medicine name']
    },
    dosage: String,
    time: String,
    type: String, // pills, syrup, etc.
    status: {
        type: String,
        enum: ['Pending', 'Taken'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Medicine', medicineSchema);
