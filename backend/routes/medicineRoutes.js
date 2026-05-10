const express = require('express');
const { getMedicines, addMedicine, updateMedicine, deleteMedicine, getHistory } = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.use(authorize('patient', 'caretaker'));

router.get('/', getMedicines);
router.post('/', addMedicine);

router.get('/history', getHistory);

router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);

module.exports = router;
