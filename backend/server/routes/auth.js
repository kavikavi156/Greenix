const express = require('express');
const User = require('../models/User.js');
const OTP = require('../models/OTP.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const EmailService = require('../services/SMSService.js'); // Now handles email
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_a_secure_secret';

// Register (admin or customer)
router.post('/register', async (req, res) => {
  try {
    const { name, email, username, password, phone, role } = req.body;
    
    console.log('Registration attempt:', { name, email, username, phone, role });
    
    // Validate input
    if (!name || !email || !username || !password || !phone || !role) {
      return res.status(400).json({ error: 'Name, email, username, password, phone, and role are required' });
    }
    
    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be 10 digits' });
    }
    
    // Check if user already exists (by username, email, or phone)
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }, { phone }] 
    });
    if (existingUser) {
      console.log('User already exists:', existingUser.username, existingUser.email);
      return res.status(400).json({ error: 'Username, email, or phone already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, username, password: hashedPassword, phone, role });
    await user.save();
    console.log('User registered successfully:', user._id);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username });
    
    // Validate input
    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('User found:', user.username, 'checking password...');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log('Password validation failed for user:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('Login successful for user:', username);
    const token = jwt.sign({ 
      userId: user._id, 
      role: user.role, 
      name: user.name, 
      email: user.email 
    }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ 
      token, 
      role: user.role, 
      userId: user._id, 
      name: user.name, 
      email: user.email 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Request OTP for forgot password
router.post('/request-otp', async (req, res) => {
  try {
    const { identifier } = req.body; // username or email
    
    console.log('OTP request for identifier:', identifier);
    
    // Validate identifier
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ error: 'Username or email is required' });
    }
    
    // Check if user exists with this username or email
    const user = await User.findOne({ 
      $or: [
        { username: identifier.trim() },
        { email: identifier.trim() }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'No account found with this username or email' });
    }
    
    if (!user.phone) {
      console.log('User found but no phone number:', user.username);
      return res.status(400).json({ 
        error: 'Your account does not have a phone number registered. Please contact support or create a new account.',
        needsPhoneUpdate: true 
      });
    }
    
    const phone = user.phone;
    const email = user.email;
    const userName = user.name;
    
    // Generate OTP
    const otp = EmailService.generateOTP();
    
    // Delete any existing OTPs for this user
    await OTP.deleteMany({ phone });
    
    // Save new OTP
    const otpDoc = new OTP({ phone, otp });
    await otpDoc.save();
    
    // Send OTP via Email
    const emailResult = await EmailService.sendOTP(email, otp, userName);
    
    if (emailResult.success) {
      console.log('OTP sent successfully to email:', email, 'for user:', user.username);
      res.json({ 
        success: true, 
        message: 'OTP sent to your registered email address',
        maskedEmail: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email: ab***@domain.com
      });
    } else {
      res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
    }
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    
    console.log('OTP verification attempt for identifier:', identifier);
    
    // Validate input
    if (!identifier || !otp) {
      return res.status(400).json({ error: 'Identifier and OTP are required' });
    }
    
    // Find user by username or email
    const user = await User.findOne({ 
      $or: [
        { username: identifier.trim() },
        { email: identifier.trim() }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const phone = user.phone;
    
    // Find OTP
    const otpDoc = await OTP.findOne({ phone, otp });
    
    if (!otpDoc) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    
    // OTP is valid, generate a temporary reset token with user ID
    const resetToken = jwt.sign({ userId: user._id, phone }, JWT_SECRET, { expiresIn: '15m' });
    
    // Delete the used OTP
    await OTP.deleteOne({ _id: otpDoc._id });
    
    console.log('OTP verified successfully for user:', user.username);
    res.json({ 
      success: true, 
      message: 'OTP verified successfully',
      resetToken
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'OTP verification failed. Please try again.' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    console.log('Password reset attempt');
    
    // Validate input
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    const { userId, phone } = decoded;
    
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify phone matches (extra security)
    if (user.phone !== phone) {
      return res.status(400).json({ error: 'Invalid reset token' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    // Send confirmation Email
    await EmailService.sendPasswordResetConfirmation(user.email, user.name);
    
    console.log('Password reset successfully for user:', user.username);
    res.json({ 
      success: true, 
      message: 'Password reset successfully. You can now login with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed. Please try again.' });
  }
});

module.exports = router;
