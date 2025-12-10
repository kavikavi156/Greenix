const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  console.log('Review verifyToken - Token received:', !!token);
  
  if (!token) {
    console.log('Review verifyToken - No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Review verifyToken - Token decoded successfully:', { userId: decoded.userId, role: decoded.role, name: decoded.name });
    req.userId = decoded.userId;
    req.userName = decoded.name || decoded.username || 'Anonymous';
    req.userRole = decoded.role;
    next();
  } catch (error) {
    console.error('Review verifyToken - Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid token', details: error.message });
  }
};

// Get all reviews (for admin) - must come before /:productId
router.get('/all', verifyToken, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('productId', 'name image averageRating')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Found ${reviews.length} reviews`);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to fetch reviews', message: error.message });
  }
});

// Get all reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Add a new review (with purchase verification)
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('=== New Review Request ===');
    console.log('User ID:', req.userId);
    console.log('User Name:', req.userName);
    console.log('Request Body:', req.body);
    
    const { productId, rating, comment } = req.body;

    // Validate input
    if (!productId || !rating || !comment) {
      console.log('Validation failed: Missing fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      console.log('Validation failed: Invalid rating');
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found:', productId);
      return res.status(404).json({ error: 'Product not found' });
    }
    console.log('Product found:', product.name);

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ 
      productId, 
      userId: req.userId 
    });

    if (existingReview) {
      console.log('User already reviewed this product');
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    // IMPORTANT: Check if user has purchased this product
    let userOrder;
    try {
      userOrder = await Order.findOne({
        user: req.userId,
        $or: [
          { 'items.product': productId },
          { 'products': productId }
        ],
        status: { $in: ['delivered', 'confirmed', 'shipped', 'ordered'] }
      });
      
      console.log('Purchase verification check:', { 
        userId: req.userId, 
        productId, 
        foundOrder: !!userOrder 
      });
    } catch (orderError) {
      console.error('Error checking purchase history:', orderError);
      // Continue without purchase verification if there's an error
      console.log('Continuing without purchase verification due to error');
    }

    if (!userOrder) {
      return res.status(403).json({ 
        error: 'You can only review products you have purchased. Please buy this product first to leave a review.' 
      });
    }

    // Create review with verified purchase badge
    // Get user name from database if not in token
    let userName = req.userName;
    if (!userName || userName === 'Anonymous') {
      try {
        const User = require('../models/User');
        const user = await User.findById(req.userId).select('name username fullName');
        userName = user?.fullName || user?.name || user?.username || 'Anonymous User';
        console.log('Fetched userName from database:', userName);
      } catch (userError) {
        console.log('Error fetching user name:', userError.message);
        userName = 'Anonymous User';
      }
    }
    
    const review = new Review({
      productId,
      userId: req.userId,
      userName: userName,
      rating,
      comment: comment.trim(),
      verifiedPurchase: !!userOrder
    });

    console.log('Saving review:', review);
    await review.save();
    console.log('Review saved successfully');

    // Update product rating stats
    await updateProductRatingStats(productId);
    console.log('Product rating stats updated');

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error('Error adding review:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    res.status(500).json({ 
      error: 'Failed to add review',
      details: error.message,
      type: error.name
    });
  }
});

// Update a review
router.put('/:reviewId', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns this review
    if (review.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }

    // Update review
    if (rating) review.rating = rating;
    if (comment) review.comment = comment.trim();

    await review.save();

    // Update product rating stats
    await updateProductRatingStats(review.productId);

    res.json({ success: true, review });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete a review
router.delete('/:reviewId', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns this review or is an admin
    if (review.userId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(reviewId);

    // Update product rating stats
    await updateProductRatingStats(productId);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Helper function to update product rating stats
async function updateProductRatingStats(productId) {
  try {
    const reviews = await Review.find({ productId });
    
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount
    });
  } catch (error) {
    console.error('Error updating product rating stats:', error);
  }
}

module.exports = router;
