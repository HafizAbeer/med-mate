const User = require('../models/User');
const Medicine = require('../models/Medicine');

// @desc    System-wide stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res) => {
    try {
        const [
            patientCount,
            caretakerCount,
            adminCount,
            unassignedPatientCount,
            medicineCount,
            verifiedUserCount,
            totalUsers
        ] = await Promise.all([
            User.countDocuments({ role: 'patient' }),
            User.countDocuments({ role: 'caretaker' }),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments({
                role: 'patient',
                $or: [{ caretaker: null }, { caretaker: { $exists: false } }]
            }),
            Medicine.countDocuments(),
            User.countDocuments({ isVerified: true }),
            User.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            data: {
                patients: patientCount,
                caretakers: caretakerCount,
                admins: adminCount,
                unassignedPatients: unassignedPatientCount,
                medicines: medicineCount,
                verifiedUsers: verifiedUserCount,
                totalUsers
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Caretakers with assigned patient counts
// @route   GET /api/admin/caretakers
// @access  Private (Admin)
exports.getCaretakersOverview = async (req, res) => {
    try {
        const caretakers = await User.find({ role: 'caretaker' })
            .select('name email firstName lastName phoneNumber createdAt')
            .sort({ name: 1 })
            .lean();

        const caretakerIds = caretakers.map((c) => c._id);
        const counts = await User.aggregate([
            { $match: { caretaker: { $in: caretakerIds } } },
            { $group: { _id: '$caretaker', count: { $sum: 1 } } }
        ]);
        const countMap = Object.fromEntries(
            counts.map((c) => [c._id.toString(), c.count])
        );

        const data = caretakers.map((c) => ({
            ...c,
            assignedPatients: countMap[c._id.toString()] || 0
        }));

        res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Patients without a caretaker
// @route   GET /api/admin/unassigned-patients
// @access  Private (Admin)
exports.getUnassignedPatients = async (req, res) => {
    try {
        const patients = await User.find({
            role: 'patient',
            $or: [{ caretaker: null }, { caretaker: { $exists: false } }]
        })
            .select('name email firstName lastName phoneNumber gender createdAt')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Assign a patient to a caretaker
// @route   PUT /api/admin/assign-patient
// @access  Private (Admin)
exports.assignPatient = async (req, res) => {
    try {
        const { patientId, caretakerId } = req.body;

        if (!patientId || !caretakerId) {
            return res.status(400).json({
                success: false,
                message: 'patientId and caretakerId are required'
            });
        }

        const patient = await User.findById(patientId);
        if (!patient || patient.role !== 'patient') {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        const caretaker = await User.findById(caretakerId);
        if (!caretaker || caretaker.role !== 'caretaker') {
            return res.status(404).json({
                success: false,
                message: 'Caretaker not found'
            });
        }

        patient.caretaker = caretakerId;
        await patient.save();

        res.status(200).json({
            success: true,
            message: `${patient.name} assigned to ${caretaker.name}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    All patients with their medicines (for admin monitoring)
// @route   GET /api/admin/patients-medicines
// @access  Private (Admin)
exports.getPatientsMedicines = async (req, res) => {
    try {
        const patients = await User.find({ role: 'patient' })
            .select('name email firstName lastName phoneNumber caretaker createdAt')
            .populate('caretaker', 'name email')
            .sort({ name: 1 })
            .lean();

        const patientIds = patients.map((p) => p._id);
        const medicines = await Medicine.find({ user: { $in: patientIds } })
            .select('user name dosage time type status createdAt')
            .sort({ time: 1, name: 1 })
            .lean();

        const byPatient = {};
        for (const med of medicines) {
            const uid = med.user.toString();
            if (!byPatient[uid]) byPatient[uid] = [];
            byPatient[uid].push(med);
        }

        const data = patients.map((p) => ({
            ...p,
            medicines: byPatient[p._id.toString()] || []
        }));

        res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
