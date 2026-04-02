const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please add a first name'],
        minlength: [3, 'First name must be at least 3 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Please add a last name'],
        minlength: [3, 'Last name must be at least 3 characters']
    },
    name: {
        type: String,
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Please add date of birth']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: [true, 'Please select gender']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    role: {
        type: String,
        enum: ['patient', 'caretaker', 'admin'],
        default: 'patient'
    },
    caretaker: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
