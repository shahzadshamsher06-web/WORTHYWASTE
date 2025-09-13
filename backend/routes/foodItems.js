const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FoodItem = require('../models/FoodItem');

// @route   GET api/food/items
// @desc    Get all food items for the logged-in user
// @access  Private
router.get('/items', auth, async (req, res) => {
  try {
    console.log('=== FOOD ITEMS REQUEST ===');
    console.log('Headers:', req.headers);
    console.log('Authenticated User ID:', req.user?.id);
    
    if (!req.user?.id) {
      console.error('No user ID in request');
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    const foodItems = await FoodItem.find({ userId: req.user.id })
      .sort({ expiryDate: 1 }) // Sort by expiry date (earliest first)
      .lean(); // Convert to plain JavaScript objects
    
    console.log(`Found ${foodItems.length} food items for user ${req.user.id}`);
    
    if (foodItems.length === 0) {
      console.log('No food items found in database for this user');
      // Return empty array instead of 404 to distinguish from errors
      return res.json({ 
        success: true, 
        foodItems: [] 
      });
    }
    
    res.json({ 
      success: true, 
      foodItems 
    });
  } catch (err) {
    console.error('Error in GET /api/food/items:', {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching food items',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
