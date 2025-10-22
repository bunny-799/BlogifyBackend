const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Profile = require('../models/Profile');
const { sendEmail } = require('../utils/sendEmail');  // 📩 for notifications

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

// @desc   Register user with OTP verification
// @route  POST /api/auth/register
// exports.registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // Validate fields
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // ✅ Generate OTP and expiry
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpires = Date.now() + 10 * 60 * 1000; // valid 10 min

//     // Create new user with OTP stored (no token yet)
//     // const user = await User.create({
//     //   name,
//     //   email,
//     //   password,
//     //   role,
//     //   otp,
//     //   otpExpires,
//     // });

//     // 📩 Send OTP to user
//     await sendEmail(
//       user.email,
//       'OTP Verification - Blogify',
//       `<p>Hello <strong>${user.name}</strong>,</p>
//        <p>Your OTP for account verification is:</p>
//        <h2>${otp}</h2>
//        <p>This code is valid for 10 minutes.</p>`
//     );

//     const user = await User.create({
//       name,
//       email,
//       password,
//       role,
//       otp,
//       otpExpires,
//     });

//     res.status(201).json({
//       success: true,
//       message: '✅ OTP sent to your email. Please verify to activate your account.',
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// @desc   Register user with OTP verification
// @route  POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ✅ Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // valid 10 min

  
    try {
      await sendEmail(
        email,
        'OTP Verification - Blogify',
        `<p>Hello <strong>${name}</strong>,</p>
         <p>Your OTP for account verification is:</p>
         <h2>${otp}</h2>
         <p>This code is valid for 10 minutes.</p>`
      );
    } catch (emailError) {
     
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please check your email settings.',
      });
    }


    const user = await User.create({
      name,
      email,
      password,
      role,
      otp,
      otpExpires,
    });

    res.status(201).json({
      success: true,
      message: '✅ OTP sent to your email. Please verify to activate your account.',
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};


// @desc   Verify OTP
// @route  POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP matches and not expired
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // ✅ Clear OTP fields
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ success: true, message: '✅ Account verified successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Login user
// @route  POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Check user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 🚫 Block login if OTP not verified
    if (user.otp || user.otpExpires) {
      return res.status(401).json({ message: 'Please verify your email with OTP before logging in.' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // ✅ Auto-create profile if not exists
    const existingProfile = await Profile.findOne({ user: user._id });
    if (!existingProfile) {
      await Profile.create({
        user: user._id,
        bio: '',
        location: '',
        avatar: '',
        social: {}
      });
    }

    // 📩 ✅ Send email to admin on user login
    await sendEmail(
      process.env.ADMIN_EMAIL || 'bunnycharycsm19@gmail.com',
      'User Login Notification',
      `<p>User <strong>${user.name}</strong> just logged in with role <strong>${user.role}</strong>.</p>`
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc   Resend OTP if expired or not received
// @route  POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newOtpExpires = Date.now() + 10 * 60 * 1000;

    user.otp = newOtp;
    user.otpExpires = newOtpExpires;
    await user.save();

    await sendEmail(
      email,
      'New OTP Verification - Blogify',
      `<p>Hello <strong>${user.name}</strong>,</p>
       <p>Your new OTP is:</p>
       <h2>${newOtp}</h2>
       <p>This code is valid for 10 minutes.</p>`
    );

    res.status(200).json({ success: true, message: '📩 New OTP sent to your email' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

