const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerName: {
    type: String,
    required: true,
    trim: true
  },
  buyerContact: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['sale', 'donation'],
    required: true
  },
  amountKg: {
    type: Number,
    required: true,
    min: 0
  },
  pricePerKg: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  wasteCategory: {
    type: String,
    enum: ['compostable', 'recyclable', 'non-usable'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'picked_up', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer', 'green_coins'],
    default: 'cash'
  },
  pickupAddress: {
    type: String,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  greenCoinsEarned: {
    type: Number,
    default: 0
  },
  co2Saved: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
transactionSchema.index({ sellerId: 1, status: 1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ scheduledDate: 1 });

// Pre-save middleware to calculate total amount
transactionSchema.pre('save', function(next) {
  this.totalAmount = this.amountKg * this.pricePerKg;
  this.greenCoinsEarned = Math.floor(this.amountKg); // 1 green coin per kg
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
