const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  greenCoins: {
    type: Number,
    default: 0
  },
  totalKgSold: {
    type: Number,
    default: 0
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  savedFoodCount: {
    type: Number,
    default: 0
  },
  profilePicture: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster phone lookups
userSchema.index({ phone: 1 });

module.exports = mongoose.model('User', userSchema);
