// src/controllers/profileController.js
const Profile = require('../models/Profile');

// 🟢 Get profile (self or admin)
exports.getProfile = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const targetUserId = req.params.userId || loggedInUserId;

    const profile = await Profile.findOne({ user: targetUserId })
      .populate('user', 'name email role');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Access control
    if (profile.user._id.toString() !== loggedInUserId && !isAdmin) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟡 Update profile (self or admin)
exports.updateProfile = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const targetUserId = req.params.userId || req.body.userId || loggedInUserId;

    // Access control: only self or admin
    if (targetUserId !== loggedInUserId && !isAdmin) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    const { bio, website, location, socialLinks } = req.body;

    const profileFields = { bio, website, location, socialLinks };

    const profile = await Profile.findOneAndUpdate(
      { user: targetUserId },
      { $set: profileFields },
      { new: true, upsert: true }
    ).populate('user', 'name email role');

    res.status(200).json({
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟣 Upload profile picture (self or admin)
exports.uploadProfileImage = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const targetUserId = req.params.userId || loggedInUserId;

    // Access control
    if (targetUserId !== loggedInUserId && !isAdmin) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Save avatar path to DB
    const imagePath = `/uploads/${req.file.filename}`;

    const profile = await Profile.findOneAndUpdate(
      { user: targetUserId },
      { avatar: imagePath },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      avatar: imagePath,
      profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
