const express = require('express');
const router = express.Router();
const DealerOrder = require('../models/DealerOrder');
const StockRequest = require('../models/StockRequest');

const Product = require('../models/Product');
const Order = require('../models/Order'); // Import Order model
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_a_secure_secret';

// Middleware to verify Dealer Token
const verifyDealer = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        if (verified.role !== 'dealer') {
            return res.status(403).json({ error: 'Dealer access required' });
        }
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// GET Dealer's Orders
router.get('/orders', verifyDealer, async (req, res) => {
    try {
        console.log('Fetching orders for Dealer ID:', req.user.userId);
        const orders = await DealerOrder.find({ dealer: req.user.userId })
            .populate('product', 'name image stock')
            .sort({ createdAt: -1 });
        console.log(`Found ${orders.length} orders for dealer ${req.user.userId}`);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching dealer orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// GET Customer Orders (Sales of Dealer's Products)
router.get('/customer-orders', verifyDealer, async (req, res) => {
    try {
        console.log('Fetching customer orders for Dealer ID:', req.user.userId);

        // 1. Find all products belonging to this dealer
        const dealerProducts = await Product.find({ dealer: req.user.userId }).select('_id');
        const productIds = dealerProducts.map(p => p._id);

        if (productIds.length === 0) {
            return res.json([]);
        }

        // 2. Find Orders that contain these products
        const orders = await Order.find({
            'items.product': { $in: productIds }
        })
            .populate('items.product')
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });

        console.log(`Found ${orders.length} customer orders for dealer products`);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching dealer customer orders:', error);
        res.status(500).json({ error: 'Failed to fetch customer orders' });
    }
});

// Dealer: Confirm Order (Ready to Supply)
router.post('/confirm-order/:orderId', verifyDealer, async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await DealerOrder.findOne({ _id: orderId, dealer: req.user.userId });

        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (order.status !== 'APPROVED') return res.status(400).json({ error: 'Order must be APPROVED before confirmation' });

        order.status = 'PROCESSING'; // or 'CONFIRMED' as per prompt, but PROCESSING is good for workflow
        // Valid statuses: ['PENDING_ADMIN_APPROVAL', 'APPROVED', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REJECTED']
        // Prompt says: Dealer determines "Confirm Supply". This usually transitions to DISPATCHED or COMPLETED.

        await order.save();
        res.json({ message: 'Order confirmed', order });
    } catch (error) {
        res.status(500).json({ error: 'Failed to confirm order' });
    }
});

// Dealer: Mark as Delivered (Updates Stock)
router.post('/deliver-order/:orderId', verifyDealer, async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await DealerOrder.findOne({ _id: orderId, dealer: req.user.userId });

        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (order.status === 'COMPLETED') return res.status(400).json({ error: 'Order already completed' });

        // Update Product Stock
        await Product.findByIdAndUpdate(order.product, {
            $inc: { stock: order.quantity }
        });

        order.status = 'COMPLETED';
        order.deliveryDate = Date.now();
        order.paymentStatus = 'PAID'; // COD: Payment collected on delivery
        order.paymentMethod = 'COD';
        order.paymentId = `COD-${Date.now()}`;
        order.transactionDate = Date.now();
        await order.save();

        // Resolve any related StockAlert
        const StockAlert = require('../models/StockAlert');
        await StockAlert.findOneAndUpdate(
            { dealerOrder: order._id },
            { status: 'RESOLVED' }
        );

        res.json({ message: 'Order delivered and stock updated', order });
    } catch (error) {
        console.error('Delivery Error:', error);
        res.status(500).json({ error: 'Failed to complete delivery' });
    }
});

// Dealer: Reject Order
router.post('/reject-order/:orderId', verifyDealer, async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await DealerOrder.findOneAndUpdate(
            { _id: orderId, dealer: req.user.userId },
            { status: 'REJECTED' },
            { new: true }
        );
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Order rejected', order });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject order' });
    }
});

// Dealer: Mark Order as PAID (Dealer confirms payment to Admin)
router.post('/mark-paid/:orderId', verifyDealer, async (req, res) => {
    try {
        const { orderId } = req.params;
        // Find order belonging to this dealer
        const order = await DealerOrder.findOne({ _id: orderId, dealer: req.user.userId });

        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Update payment status
        order.paymentStatus = 'PAID';
        await order.save();

        res.json({ message: 'Payment status updated to PAID', order });
    } catch (error) {
        console.error('Error marking order as paid:', error);
        res.status(500).json({ error: 'Failed to update payment status' });
    }
});


// Dealer: Create Stock Request
router.post('/request-stock', verifyDealer, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({ error: 'Product and quantity are required' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check for existing pending request
        const existingRequest = await StockRequest.findOne({
            dealer: req.user.userId,
            product: productId,
            status: 'PENDING_ADMIN_APPROVAL'
        });

        if (existingRequest) {
            return res.status(400).json({ error: 'You already have a pending request for this product' });
        }

        // Explicitly check for dealer to ensure ID is valid
        const dealer = await require('../models/Dealer').findById(req.user.userId);
        if (!dealer) {
            console.error('Dealer not found for ID:', req.user.userId);
            return res.status(404).json({ error: 'Dealer account not found' });
        }

        console.log(`Creating Stock Request for Dealer: ${dealer.name} (${dealer._id}) - Product: ${product.name}`);

        const stockRequest = new StockRequest({
            dealer: dealer._id,
            product: productId,
            currentStock: product.stock, // Snapshot of stock at request time
            requestedQuantity: quantity,
            status: 'PENDING_ADMIN_APPROVAL'
        });

        await stockRequest.save();
        res.status(201).json({ message: 'Stock request submitted successfully', stockRequest });
    } catch (error) {
        console.error('Error creating stock request:', error);
        res.status(500).json({ error: 'Failed to create stock request' });
    }
});

// Dealer: Get My Requests (Pending/Rejected history NOT in Orders yet)
router.get('/my-requests', verifyDealer, async (req, res) => {
    try {
        const requests = await StockRequest.find({ dealer: req.user.userId })
            .populate('product', 'name image')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Dealer: Get Profile
router.get('/profile', verifyDealer, async (req, res) => {
    try {
        const dealer = await require('../models/Dealer').findById(req.user.userId).select('-password');
        if (!dealer) return res.status(404).json({ error: 'Dealer not found' });
        res.json(dealer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Dealer: Update Profile
router.put('/profile', verifyDealer, async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const dealer = await require('../models/Dealer').findById(req.user.userId);

        if (!dealer) return res.status(404).json({ error: 'Dealer not found' });

        if (name) dealer.name = name;
        if (phone) dealer.phone = phone;
        if (address) dealer.address = { ...dealer.address, ...address };

        await dealer.save();
        res.json({ message: 'Profile updated successfully', dealer });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;
