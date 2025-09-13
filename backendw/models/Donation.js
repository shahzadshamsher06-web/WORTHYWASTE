const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientName: {
    type: String,
    required: true,
    trim: true
  },
  recipientContact: {
    type: String,
    required: true
  },
  foodItems: [{
    name: String,
    quantity: Number,
    unit: String,
    expiryDate: Date
  }],
  totalWeight: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'picked_up', 'delivered', 'cancelled'],
    default: 'pending'
  },
  donationType: {
    type: String,
    enum: ['charity', 'community', 'food_bank', 'individual'],
    default: 'charity'
  },
  pickupAddress: {
    type: String,
    required: true
  },
  deliveryAddress: {
    type: String,
    default: ''
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  },
  greenCoinsEarned: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
donationSchema.index({ donorId: 1, status: 1 });
donationSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model('Donation', donationSchema);
