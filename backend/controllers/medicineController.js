const User = require('../models/User');
const Medicine = require('../models/Medicine');

async function userCanAccessMedicine(req, medicine) {
    const ownerId = medicine.user.toString();
    if (req.user.role === 'patient') {
        return ownerId === req.user.id;
    }
    if (req.user.role === 'caretaker') {
        const patient = await User.findById(medicine.user);
        return (
            patient &&
            patient.caretaker &&
            patient.caretaker.toString() === req.user.id
        );
    }
    return false;
}

// @desc    Get all medicines for logged in user
// @route   GET /api/medicine
// @access  Private
exports.getMedicines = async (req, res) => {
    try {
        let query;

        if (req.user.role === 'caretaker') {
            // Find all patients associated with this caretaker
            const patients = await User.find({ caretaker: req.user.id });
            const patientIds = patients.map(p => p._id);

            // If caretaker wants medicines for a specific patient
            if (req.query.patientId) {
                if (!patientIds.map(id => id.toString()).includes(req.query.patientId)) {
                    return res.status(403).json({ success: false, message: 'Not authorized to view this patient' });
                }
                query = { user: req.query.patientId };
            } else {
                // Otherwise find all medicines for all their patients
                query = { user: { $in: patientIds } };
            }
        } else {
            // Patient sees their own medicines
            query = { user: req.user.id };
        }

        const medicines = await Medicine.find(query);
        res.status(200).json({ success: true, count: medicines.length, data: medicines });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add a medicine
// @route   POST /api/medicine
// @access  Private
exports.addMedicine = async (req, res) => {
    try {
        const payload = { ...req.body };
        delete payload.patientId;

        if (req.user.role === 'caretaker') {
            const { patientId } = req.body;
            if (!patientId) {
                return res.status(400).json({
                    success: false,
                    message: 'patientId is required to add medicine for a patient'
                });
            }
            const patient = await User.findById(patientId);
            if (!patient || patient.role !== 'patient') {
                return res.status(404).json({ success: false, message: 'Patient not found' });
            }
            if (!patient.caretaker || patient.caretaker.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only add medicines for your own patients'
                });
            }
            payload.user = patient._id;
        } else {
            payload.user = req.user.id;
        }

        const medicine = await Medicine.create(payload);
        res.status(201).json({ success: true, data: medicine });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update medicine (e.g., mark as Taken)
// @route   PUT /api/medicine/:id
// @access  Private
exports.updateMedicine = async (req, res) => {
    try {
        let medicine = await Medicine.findById(req.params.id);

        if (!medicine) {
            return res.status(404).json({ success: false, message: 'Medicine not found' });
        }

        const allowed = await userCanAccessMedicine(req, medicine);
        if (!allowed) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: medicine });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete medicine
// @route   DELETE /api/medicine/:id
// @access  Private
exports.deleteMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (!medicine) {
            return res.status(404).json({ success: false, message: 'Medicine not found' });
        }

        const allowed = await userCanAccessMedicine(req, medicine);
        if (!allowed) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await medicine.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
