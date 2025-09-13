const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// POST /api/auth/login - Phone login: create user if not exists, return user object
router.post('/login', async (req, res) => {
  try {
    const { phone, name, email } = req.body;

    // Validate phone number
    if (!phone || phone.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/\D/g, '');

    // Check if user exists
    let user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        phone: cleanPhone,
        name: name || '',
        email: email || ''
      });
      await user.save();
    } else {
      // Update user info if provided
      if (name && name.trim().length > 0) {
        user.name = name;
      }
      if (email && email.trim().length > 0) {
        user.email = email;
      }
      await user.save();
    }

    // Create JWT token
    const token = jwt.sign(
      { user: { id: user._id } },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' }
    );

    // Return user object with token (excluding sensitive data)
    const userResponse = {
      _id: user._id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      greenCoins: user.greenCoins,
      totalKgSold: user.totalKgSold,
      totalEarned: user.totalEarned,
      savedFoodCount: user.savedFoodCount,
      profilePicture: user.profilePicture,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      message: user.createdAt === user.updatedAt ? 'User created successfully' : 'Login successful',
      user: userResponse,
      token // Include the JWT token in the response
    });

  } catch (error) {
    console.error('Auth login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/auth/user/:userId - Get user profile
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userResponse = {
      _id: user._id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      greenCoins: user.greenCoins,
      totalKgSold: user.totalKgSold,
      totalEarned: user.totalEarned,
      savedFoodCount: user.savedFoodCount,
      profilePicture: user.profilePicture,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
