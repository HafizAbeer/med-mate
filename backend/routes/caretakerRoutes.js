const express = require('express');
const router = express.Router();
const { addPatient, getPatients } = require('../controllers/caretakerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('caretaker'));

router.post('/add-patient', addPatient);
router.get('/patients', getPatients);

module.exports = router;
