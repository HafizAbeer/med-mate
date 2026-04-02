const express = require('express');
const { getMedicines, addMedicine, updateMedicine, deleteMedicine } = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.use(authorize('patient', 'caretaker'));

router.route('/')
    .get(getMedicines)
    .post(addMedicine);

router.route('/:id')
    .put(updateMedicine)
    .delete(deleteMedicine);

module.exports = router;
