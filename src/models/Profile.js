// src/models/Profile.js
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bio: String,
    website: String,
    location: String,
    socialLinks: {
      twitter: String,
      github: String,
      linkedin: String,
      instagram: String,
    },
    avatar: {
      type: String, // stores filename like "profile-6715.png"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
