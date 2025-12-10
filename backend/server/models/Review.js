const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for user-product combination (one review per user per product)
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Index for sorting by date
reviewSchema.index({ createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
