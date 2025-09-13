const express = require('express');
const User = require('../models/User');
const FoodItem = require('../models/FoodItem');
const Transaction = require('../models/Transaction');
const router = express.Router();

// GET /api/analytics/summary/:userId - Return aggregated stats
router.get('/summary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get current date for time-based calculations
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get food items statistics
    const [
      totalFoodItems,
      expiredItems,
      expiringSoonItems,
      recentlyAddedItems
    ] = await Promise.all([
      FoodItem.countDocuments({ userId }),
      FoodItem.countDocuments({ userId, status: 'expired' }),
      FoodItem.countDocuments({ userId, status: 'expiring_soon' }),
      FoodItem.countDocuments({ userId, createdAt: { $gte: sevenDaysAgo } })
    ]);

    // Get transaction statistics
    const [
      totalTransactions,
      completedTransactions,
      totalSales,
      totalDonations,
      recentTransactions
    ] = await Promise.all([
      Transaction.countDocuments({ sellerId: userId }),
      Transaction.countDocuments({ sellerId: userId, status: 'completed' }),
      Transaction.countDocuments({ sellerId: userId, type: 'sale' }),
      Transaction.countDocuments({ sellerId: userId, type: 'donation' }),
      Transaction.countDocuments({ sellerId: userId, createdAt: { $gte: thirtyDaysAgo } })
    ]);

    // Calculate total earnings and kg sold from completed transactions
    const completedSales = await Transaction.find({
      sellerId: userId,
      type: 'sale',
      status: 'completed'
    }).select('totalAmount amountKg');

    const calculatedTotalEarned = completedSales.reduce((sum, transaction) => sum + transaction.totalAmount, 0);
    const calculatedKgSold = completedSales.reduce((sum, transaction) => sum + transaction.amountKg, 0);

    // Calculate CO2 savings (mock calculation: 2.5kg CO2 per kg of waste diverted)
    const totalCO2Saved = calculatedKgSold * 2.5;

    // Calculate waste prevention rate
    const wastePreventionRate = totalFoodItems > 0 ? ((totalFoodItems - expiredItems) / totalFoodItems * 100) : 0;

    // Get monthly breakdown for the last 6 months
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const [monthlyTransactions, monthlyFoodItems] = await Promise.all([
        Transaction.countDocuments({
          sellerId: userId,
          createdAt: { $gte: monthStart, $lte: monthEnd }
        }),
        FoodItem.countDocuments({
          userId,
          createdAt: { $gte: monthStart, $lte: monthEnd }
        })
      ]);

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        transactions: monthlyTransactions,
        foodItems: monthlyFoodItems
      });
    }

    // Calculate achievements/badges
    const achievements = [];
    if (user.greenCoins >= 100) achievements.push('Green Champion');
    if (calculatedKgSold >= 50) achievements.push('Waste Warrior');
    if (totalDonations >= 5) achievements.push('Community Helper');
    if (wastePreventionRate >= 80) achievements.push('Food Saver');
    if (totalCO2Saved >= 100) achievements.push('Carbon Reducer');

    // Prepare summary response
    const summary = {
      // Basic user stats (from user model)
      savedFoodCount: user.savedFoodCount,
      kgSold: user.totalKgSold,
      totalEarned: user.totalEarned,
      greenCoinsEarned: user.greenCoins,

      // Calculated stats
      calculatedKgSold,
      calculatedTotalEarned,
      totalCO2Saved: Math.round(totalCO2Saved * 100) / 100,

      // Food inventory stats
      foodInventory: {
        total: totalFoodItems,
        expired: expiredItems,
        expiringSoon: expiringSoonItems,
        fresh: totalFoodItems - expiredItems - expiringSoonItems,
        recentlyAdded: recentlyAddedItems,
        wastePreventionRate: Math.round(wastePreventionRate * 100) / 100
      },

      // Transaction stats
      transactions: {
        total: totalTransactions,
        completed: completedTransactions,
        sales: totalSales,
        donations: totalDonations,
        recent: recentTransactions,
        successRate: totalTransactions > 0 ? Math.round((completedTransactions / totalTransactions) * 100) : 0
      },

      // Environmental impact
      environmentalImpact: {
        co2Saved: Math.round(totalCO2Saved * 100) / 100,
        treesEquivalent: Math.round((totalCO2Saved / 22) * 100) / 100, // Approx 22kg CO2 per tree per year
        wasteReduced: calculatedKgSold,
        waterSaved: Math.round(calculatedKgSold * 1000), // Estimate 1000L water saved per kg
      },

      // Achievements and gamification
      achievements,
      level: Math.floor(user.greenCoins / 50) + 1,
      nextLevelCoins: ((Math.floor(user.greenCoins / 50) + 1) * 50) - user.greenCoins,

      // Trends
      monthlyData,

      // Quick insights
      insights: [
        totalFoodItems > 0 && expiredItems === 0 ? 'Great job! No expired food items.' : null,
        expiringSoonItems > 0 ? `${expiringSoonItems} items expiring soon - consider selling or donating!` : null,
        recentTransactions > 0 ? `You've been active with ${recentTransactions} transactions this month.` : null,
        wastePreventionRate >= 90 ? 'Excellent waste prevention rate!' : null
      ].filter(Boolean)
    };

    res.status(200).json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('Get analytics summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/analytics/leaderboard - Get top users (for gamification)
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10, metric = 'greenCoins' } = req.query;

    // Validate metric
    const validMetrics = ['greenCoins', 'totalKgSold', 'totalEarned', 'savedFoodCount'];
    if (!validMetrics.includes(metric)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid metric. Must be one of: ' + validMetrics.join(', ')
      });
    }

    // Get top users based on metric
    const sortField = {};
    sortField[metric] = -1;

    const topUsers = await User.find({ isActive: true })
      .select('name phone greenCoins totalKgSold totalEarned savedFoodCount createdAt')
      .sort(sortField)
      .limit(parseInt(limit))
      .lean();

    // Add ranking and anonymize phone numbers
    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      name: user.name || 'Anonymous User',
      phone: user.phone ? `****${user.phone.slice(-4)}` : '****',
      greenCoins: user.greenCoins,
      totalKgSold: user.totalKgSold,
      totalEarned: user.totalEarned,
      savedFoodCount: user.savedFoodCount,
      memberSince: user.createdAt
    }));

    res.status(200).json({
      success: true,
      metric,
      leaderboard
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/analytics/global-stats - Get platform-wide statistics
router.get('/global-stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalFoodItems,
      totalTransactions,
      totalKgProcessed,
      totalEarnings
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      FoodItem.countDocuments(),
      Transaction.countDocuments(),
      Transaction.aggregate([
        { $group: { _id: null, total: { $sum: '$amountKg' } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'sale' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    const globalStats = {
      totalUsers,
      totalFoodItems,
      totalTransactions,
      totalKgProcessed: totalKgProcessed[0]?.total || 0,
      totalEarnings: totalEarnings[0]?.total || 0,
      totalCO2Saved: Math.round((totalKgProcessed[0]?.total || 0) * 2.5 * 100) / 100,
      averagePerUser: {
        kgProcessed: totalUsers > 0 ? Math.round((totalKgProcessed[0]?.total || 0) / totalUsers * 100) / 100 : 0,
        earnings: totalUsers > 0 ? Math.round((totalEarnings[0]?.total || 0) / totalUsers * 100) / 100 : 0
      }
    };

    res.status(200).json({
      success: true,
      globalStats
    });

  } catch (error) {
    console.error('Get global stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
