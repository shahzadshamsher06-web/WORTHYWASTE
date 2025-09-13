const express = require('express');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const router = express.Router();

// Mock buyers/composters data
const mockBuyers = [
  {
    id: 'buyer_001',
    name: 'GreenEarth Composting Co.',
    type: 'composter',
    contact: '+91-9876543210',
    email: 'contact@greenearth.com',
    ratePerKg: 15,
    wasteTypes: ['compostable'],
    location: 'Mumbai, Maharashtra',
    rating: 4.8,
    verified: true
  },
  {
    id: 'buyer_002',
    name: 'RecyclePro Industries',
    type: 'recycler',
    contact: '+91-9876543211',
    email: 'sales@recyclepro.com',
    ratePerKg: 25,
    wasteTypes: ['recyclable'],
    location: 'Delhi, NCR',
    rating: 4.6,
    verified: true
  },
  {
    id: 'buyer_003',
    name: 'EcoWaste Solutions',
    type: 'waste_management',
    contact: '+91-9876543212',
    email: 'info@ecowaste.com',
    ratePerKg: 12,
    wasteTypes: ['compostable', 'recyclable'],
    location: 'Bangalore, Karnataka',
    rating: 4.5,
    verified: true
  },
  {
    id: 'buyer_004',
    name: 'Urban Compost Hub',
    type: 'composter',
    contact: '+91-9876543213',
    email: 'hello@urbancompost.com',
    ratePerKg: 18,
    wasteTypes: ['compostable'],
    location: 'Pune, Maharashtra',
    rating: 4.7,
    verified: true
  },
  {
    id: 'buyer_005',
    name: 'MetalRecycle Corp',
    type: 'recycler',
    contact: '+91-9876543214',
    email: 'purchase@metalrecycle.com',
    ratePerKg: 35,
    wasteTypes: ['recyclable'],
    location: 'Chennai, Tamil Nadu',
    rating: 4.4,
    verified: true
  },
  {
    id: 'buyer_006',
    name: 'Community Green Initiative',
    type: 'community',
    contact: '+91-9876543215',
    email: 'donate@communitygreen.org',
    ratePerKg: 8,
    wasteTypes: ['compostable', 'recyclable'],
    location: 'Hyderabad, Telangana',
    rating: 4.9,
    verified: true
  }
];

// GET /api/marketplace/buyers - Return mocked list of buyers/composters
router.get('/buyers', async (req, res) => {
  try {
    const { wasteType, location, minRate, maxRate } = req.query;

    let filteredBuyers = [...mockBuyers];

    // Filter by waste type
    if (wasteType) {
      filteredBuyers = filteredBuyers.filter(buyer => 
        buyer.wasteTypes.includes(wasteType)
      );
    }

    // Filter by location (simple string match)
    if (location) {
      filteredBuyers = filteredBuyers.filter(buyer => 
        buyer.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Filter by rate range
    if (minRate) {
      filteredBuyers = filteredBuyers.filter(buyer => 
        buyer.ratePerKg >= parseFloat(minRate)
      );
    }

    if (maxRate) {
      filteredBuyers = filteredBuyers.filter(buyer => 
        buyer.ratePerKg <= parseFloat(maxRate)
      );
    }

    // Sort by rating (highest first) and then by rate (highest first)
    filteredBuyers.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.ratePerKg - a.ratePerKg;
    });

    res.status(200).json({
      success: true,
      totalBuyers: filteredBuyers.length,
      buyers: filteredBuyers
    });

  } catch (error) {
    console.error('Get buyers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/marketplace/sell - Accept sale/donation request
router.post('/sell', async (req, res) => {
  try {
    const { 
      userId, 
      type, 
      amountKg, 
      buyerName, 
      pricePerKg, 
      wasteCategory,
      pickupAddress,
      scheduledDate,
      notes 
    } = req.body;

    // Validate required fields
    if (!userId || !type || !amountKg || !buyerName || !pickupAddress) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, type, amountKg, buyerName, pickupAddress'
      });
    }

    // Validate type
    if (!['sale', 'donation'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "sale" or "donation"'
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

    // Find buyer details from mock data
    const buyer = mockBuyers.find(b => b.name === buyerName);
    const buyerContact = buyer ? buyer.contact : 'Contact via platform';

    // Set default values
    const finalPricePerKg = pricePerKg || (buyer ? buyer.ratePerKg : 0);
    const finalWasteCategory = wasteCategory || 'compostable';
    const finalScheduledDate = scheduledDate ? new Date(scheduledDate) : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to tomorrow

    // Create transaction
    const transaction = new Transaction({
      sellerId: userId,
      buyerName,
      buyerContact,
      type,
      amountKg: parseFloat(amountKg),
      pricePerKg: finalPricePerKg,
      wasteCategory: finalWasteCategory,
      pickupAddress,
      scheduledDate: finalScheduledDate,
      notes: notes || ''
    });

    await transaction.save();

    // Update user stats
    const greenCoinsEarned = Math.floor(parseFloat(amountKg)); // 1 coin per kg
    const totalEarned = type === 'sale' ? parseFloat(amountKg) * finalPricePerKg : 0;

    await User.findByIdAndUpdate(userId, {
      $inc: {
        greenCoins: greenCoinsEarned,
        totalKgSold: parseFloat(amountKg),
        totalEarned: totalEarned
      }
    });

    // Calculate estimated CO2 savings (mock calculation)
    const co2Saved = parseFloat(amountKg) * 2.5; // Assume 2.5kg CO2 saved per kg of waste diverted

    res.status(201).json({
      success: true,
      message: `${type === 'sale' ? 'Sale' : 'Donation'} request created successfully`,
      transaction: {
        ...transaction.toObject(),
        co2Saved,
        greenCoinsEarned
      }
    });

  } catch (error) {
    console.error('Create sale/donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/marketplace/transactions/:userId - Get user's transactions
router.get('/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, type } = req.query;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build query
    const query = { sellerId: userId };
    if (status) query.status = status;
    if (type) query.type = type;

    // Get transactions sorted by creation date (newest first)
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Add calculated fields
    const transactionsWithCalcs = transactions.map(transaction => ({
      ...transaction,
      co2Saved: transaction.amountKg * 2.5, // Mock calculation
      daysUntilPickup: Math.ceil((new Date(transaction.scheduledDate) - new Date()) / (1000 * 60 * 60 * 24))
    }));

    res.status(200).json({
      success: true,
      totalTransactions: transactions.length,
      transactions: transactionsWithCalcs
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/marketplace/transaction/:id/status - Update transaction status
router.put('/transaction/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, completedDate } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'picked_up', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    // Find transaction
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Update transaction
    const updateData = { status };
    if (status === 'completed' && completedDate) {
      updateData.completedDate = new Date(completedDate);
    } else if (status === 'completed') {
      updateData.completedDate = new Date();
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Transaction status updated successfully',
      transaction: updatedTransaction
    });

  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
