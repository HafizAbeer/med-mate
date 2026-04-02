const User = require('../models/User');

// @desc    Register a new patient under this caretaker (pre-verified)
// @route   POST /api/caretaker/add-patient
// @access  Private (Caretaker)
exports.addPatient = async (req, res) => {
    try {
        const { firstName, lastName, email, password, dateOfBirth, gender, phoneNumber } = req.body;

        const fn = typeof firstName === 'string' ? firstName.trim() : '';
        const ln = typeof lastName === 'string' ? lastName.trim() : '';

        if (fn.length < 3 || ln.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'First and last name must be at least 3 characters'
            });
        }

        if (!email || !password || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Valid email and password (min 8 characters) are required'
            });
        }

        if (!dateOfBirth || !gender || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Date of birth, gender, and phone number are required'
            });
        }

        if (!['Male', 'Female', 'Other'].includes(gender)) {
            return res.status(400).json({ success: false, message: 'Invalid gender' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'An account already exists with this email'
            });
        }

        const patient = await User.create({
            firstName: fn,
            lastName: ln,
            name: `${fn} ${ln}`,
            email,
            password,
            dateOfBirth,
            gender,
            phoneNumber,
            role: 'patient',
            caretaker: req.user.id,
            isVerified: true,
            verificationCode: undefined
        });

        res.status(201).json({
            success: true,
            message: `Patient ${patient.name} added successfully`,
            data: patient
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all patients for current caretaker
// @route   GET /api/caretaker/patients
// @access  Private (Caretaker)
exports.getPatients = async (req, res) => {
    try {
        const patients = await User.find({ caretaker: req.user.id });

        res.status(200).json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
