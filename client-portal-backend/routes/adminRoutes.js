const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const Client = require('../models/Client');
const Company = require("../models/Company");
const { verifyAdminToken } = require('../middleware/authmiddleware');

// ========================
// Function to generate JWT token
// ========================
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }  // Token will expire in 1 hour
  );
};

// ========================
// Admin Registration Route
// ========================
router.post('/register-admin', async (req, res) => {
  const { email, password, adminCode } = req.body;

  const expectedCode = 'msgadmin123'; // Your private admin registration code

  if (adminCode !== expectedCode) {
    return res.status(403).json({ success: false, message: 'Invalid admin code' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await newAdmin.save();
    return res.status(201).json({ success: true, message: 'Admin registered successfully' });

  } catch (error) {
    console.error('Admin registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ========================
// Admin Login Route
// ========================
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Not an admin' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      role: user.role,
      email: user.email
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});






module.exports = router;