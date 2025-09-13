const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    default: 'kg'
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  storage: {
    type: String,
    enum: ['refrigerator', 'freezer', 'pantry', 'counter'],
    default: 'pantry'
  },
  calories: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['fruits', 'vegetables', 'dairy', 'meat', 'grains', 'beverages', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['fresh', 'expiring_soon', 'expired', 'consumed', 'donated', 'sold'],
    default: 'fresh'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
foodItemSchema.index({ userId: 1, expiryDate: 1 });
foodItemSchema.index({ userId: 1, status: 1 });

// Virtual to check if item is expiring soon (within 3 days)
foodItemSchema.virtual('isExpiringSoon').get(function() {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  return this.expiryDate <= threeDaysFromNow && this.expiryDate > new Date();
});

// Virtual to check if item is expired
foodItemSchema.virtual('isExpired').get(function() {
  return this.expiryDate < new Date();
});

module.exports = mongoose.model('FoodItem', foodItemSchema);
