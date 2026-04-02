const express = require('express');
const router = express.Router();
const {
    getStats,
    getCaretakersOverview,
    getUnassignedPatients,
    assignPatient,
    getPatientsMedicines
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/caretakers', getCaretakersOverview);
router.get('/unassigned-patients', getUnassignedPatients);
router.get('/patients-medicines', getPatientsMedicines);
router.put('/assign-patient', assignPatient);

module.exports = router;
