const express = require('express');
const { registerUser, loginUser,verifyOTP,resendOTP} = require('../controllers/authController');

const router = express.Router();
 
// Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);

router.post('/resend-otp', resendOTP);

module.exports = router;
