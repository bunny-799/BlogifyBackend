const express = require('express');
const {
  getProfile,
  updateProfile,
  uploadProfileImage
} = require('../controllers/profileController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', verifyToken, getProfile);
router.get('/:userId', verifyToken, getProfile);

router.put('/', verifyToken, updateProfile);
router.put('/:userId', verifyToken, updateProfile);

// 🟣 Upload profile image (self or admin)
router.post('/upload', verifyToken, upload.single('avatar'), uploadProfileImage);
router.post('/:userId/upload', verifyToken, upload.single('avatar'), uploadProfileImage);

module.exports = router;
