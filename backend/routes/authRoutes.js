const express = require('express');
const {
    signup,
    verifyEmail,
    login,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    resendCode,
    updateProfile,
    changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/resend-code', resendCode);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.put('/resetpassword', resetPassword);

router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;
