const express = require('express');
const FoodItem = require('../models/FoodItem');
const User = require('../models/User');
const router = express.Router();

// POST /api/inventory/add - Add food item
router.post('/add', async (req, res) => {
  try {
    const { userId, name, quantity, purchaseDate, expiryDate, storage, calories, category, unit, notes } = req.body;

    // Validate required fields
    if (!userId || !name || !quantity || !purchaseDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, name, quantity, purchaseDate, expiryDate'
      });
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create new food item
    const foodItem = new FoodItem({
      userId,
      name: name.trim(),
      quantity: parseFloat(quantity),
      unit: unit || 'kg',
      purchaseDate: new Date(purchaseDate),
      expiryDate: new Date(expiryDate),
      storage: storage || 'pantry',
      calories: parseInt(calories) || 0,
      category: category || 'other',
      notes: notes || ''
    });

    // Determine status based on expiry date
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    if (foodItem.expiryDate < now) {
      foodItem.status = 'expired';
    } else if (foodItem.expiryDate <= threeDaysFromNow) {
      foodItem.status = 'expiring_soon';
    } else {
      foodItem.status = 'fresh';
    }

    await foodItem.save();

    // Update user's saved food count
    await User.findByIdAndUpdate(userId, { $inc: { savedFoodCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Food item added successfully',
      foodItem
    });

  } catch (error) {
    console.error('Add food item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/inventory/list/:userId - List items for user sorted by expiry
router.get('/list/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, category, storage } = req.query;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build query filters
    const query = { userId };
    if (status) query.status = status;
    if (category) query.category = category;
    if (storage) query.storage = storage;

    // Get food items sorted by expiry date (earliest first)
    const foodItems = await FoodItem.find(query)
      .sort({ expiryDate: 1, createdAt: -1 })
      .lean();

    // Add virtual fields manually since we're using lean()
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const itemsWithStatus = foodItems.map(item => ({
      ...item,
      isExpired: item.expiryDate < now,
      isExpiringSoon: item.expiryDate <= threeDaysFromNow && item.expiryDate > now,
      daysUntilExpiry: Math.ceil((item.expiryDate - now) / (1000 * 60 * 60 * 24))
    }));

    // Group items by status for better organization
    const groupedItems = {
      expired: itemsWithStatus.filter(item => item.isExpired),
      expiring_soon: itemsWithStatus.filter(item => item.isExpiringSoon),
      fresh: itemsWithStatus.filter(item => !item.isExpired && !item.isExpiringSoon)
    };

    res.status(200).json({
      success: true,
      totalItems: foodItems.length,
      items: itemsWithStatus,
      groupedItems
    });

  } catch (error) {
    console.error('List food items error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/inventory/:id - Delete item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the food item
    const foodItem = await FoodItem.findById(id);
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    // Store userId before deletion
    const userId = foodItem.userId;

    await FoodItem.findByIdAndDelete(id);

    // Update user's saved food count (decrease by 1)
    await User.findByIdAndUpdate(userId, { $inc: { savedFoodCount: -1 } });

    res.status(200).json({
      success: true,
      message: 'Food item deleted successfully'
    });

  } catch (error) {
    console.error('Delete food item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/inventory/:id - Update food item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the food item
    const foodItem = await FoodItem.findById(id);
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'quantity', 'unit', 'expiryDate', 'storage', 'calories', 'category', 'status', 'notes'];
    const updateData = {};

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    // Update expiry date handling
    if (updates.expiryDate) {
      updateData.expiryDate = new Date(updates.expiryDate);
      
      // Auto-update status based on new expiry date
      const now = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      if (updateData.expiryDate < now) {
        updateData.status = 'expired';
      } else if (updateData.expiryDate <= threeDaysFromNow) {
        updateData.status = 'expiring_soon';
      } else if (!updates.status) { // Only auto-update if status wasn't explicitly provided
        updateData.status = 'fresh';
      }
    }

    const updatedFoodItem = await FoodItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Food item updated successfully',
      foodItem: updatedFoodItem
    });

  } catch (error) {
    console.error('Update food item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
