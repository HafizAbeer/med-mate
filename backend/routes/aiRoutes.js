const express = require('express');
const router = express.Router();
const { getSuggestions, chatWithAI } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('patient', 'caretaker'));

router.get('/suggestions', getSuggestions);
router.post('/chat', chatWithAI);

module.exports = router;
