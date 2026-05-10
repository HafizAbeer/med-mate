const mongoose = require('mongoose');

const medicineLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    medicine: {
        type: mongoose.Schema.ObjectId,
        ref: 'Medicine',
        required: true
    },
    medicineName: String,
    status: {
        type: String,
        enum: ['Taken', 'Missed'],
        required: true
    },
    time: String,
    dosage: String,
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MedicineLog', medicineLogSchema);
