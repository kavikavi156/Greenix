const express = require('express');
const router = express.Router();
const StockRequest = require('../models/StockRequest');
const DealerOrder = require('../models/DealerOrder');
const Product = require('../models/Product');
const Dealer = require('../models/Dealer');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_a_secure_secret';

// Middleware to verify Admin Token
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        if (verified.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// GET all stock requests (with auto-generation for low stock)
router.get('/stock-requests', verifyAdmin, async (req, res) => {
    try {
        // 1. Find all low stock products
        const lowStockProducts = await Product.find({
            $expr: { $lte: ['$stock', '$lowStockThreshold'] }
        });

        // 2. For each low stock product, ensure a pending request exists
        for (const product of lowStockProducts) {
            const existingRequest = await StockRequest.findOne({
                product: product._id,
                status: 'PENDING_ADMIN_APPROVAL'
            });

            if (!existingRequest) {
                // Auto-create request
                await new StockRequest({
                    product: product._id,
                    currentStock: product.stock,
                    requestedQuantity: product.reorderQuantity || 50,
                    status: 'PENDING_ADMIN_APPROVAL'
                }).save();
                console.log(`Auto-generated stock request for low stock product: ${product.name}`);
            }
        }

        // 3. Fetch all requests (now including newly created ones)
        const requests = await StockRequest.find()
            .populate('product')
            .populate('dealer', 'name email phone')
            .populate({
                path: 'dealerOrder',
                populate: { path: 'dealer', select: 'name email phone' }
            })
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching/generating stock requests:', error);
        res.status(500).json({ error: 'Failed to fetch stock requests' });
    }
});

// GET pending stock requests (for notifications)
router.get('/stock-requests/pending', verifyAdmin, async (req, res) => {
    try {
        // 1. Find all low stock products
        const lowStockProducts = await Product.find({
            $expr: { $lte: ['$stock', '$lowStockThreshold'] }
        });

        // 2. For each low stock product, ensure a pending request exists
        for (const product of lowStockProducts) {
            const existingRequest = await StockRequest.findOne({
                product: product._id,
                status: 'PENDING_ADMIN_APPROVAL'
            });

            if (!existingRequest) {
                await new StockRequest({
                    product: product._id,
                    currentStock: product.stock,
                    requestedQuantity: product.reorderQuantity || 50,
                    status: 'PENDING_ADMIN_APPROVAL'
                }).save();
            }
        }

        const requests = await StockRequest.find({ status: 'PENDING_ADMIN_APPROVAL' })
            .populate('product')
            .populate('dealer', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending requests' });
    }
});

// GET low stock products
router.get('/low-stock-products', verifyAdmin, async (req, res) => {
    try {
        const lowStockProducts = await Product.find({
            $expr: { $lte: ['$stock', '$lowStockThreshold'] }
        }).populate('dealer');
        res.json(lowStockProducts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch low stock products' });
    }
});

// CREATE stock request for low stock product
router.post('/create-stock-request/:productId', verifyAdmin, async (req, res) => {
    try {
        const { productId } = req.params;
        const { requestedQuantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // Check if there's already a pending request for this product
        const existingRequest = await StockRequest.findOne({
            product: productId,
            status: 'PENDING_ADMIN_APPROVAL'
        });

        if (existingRequest) {
            return res.status(400).json({ error: 'A pending stock request already exists for this product' });
        }

        const stockRequest = new StockRequest({
            product: productId,
            currentStock: product.stock,
            requestedQuantity: requestedQuantity || product.reorderQuantity || 50
        });

        await stockRequest.save();
        const populatedRequest = await StockRequest.findById(stockRequest._id).populate('product');

        res.status(201).json({ message: 'Stock request created', stockRequest: populatedRequest });
    } catch (error) {
        console.error('Create Stock Request Error:', error);
        res.status(500).json({ error: 'Failed to create stock request' });
    }
});

// GET all dealers
router.get('/dealers', verifyAdmin, async (req, res) => {
    try {
        const dealers = await Dealer.find({ status: 'active' });
        res.json(dealers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dealers' });
    }
});

// APPROVE Stock Request & Create Dealer Order
router.post('/approve-request/:requestId', verifyAdmin, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { dealerId, quantity } = req.body;

        const stockRequest = await StockRequest.findById(requestId).populate('product');
        if (!stockRequest) return res.status(404).json({ error: 'Request not found' });

        // If dealerId is not provided in body, prioritize the requesting dealer, then product default dealer
        const finalDealerId = dealerId || stockRequest.dealer || (stockRequest.product && stockRequest.product.dealer);

        if (!finalDealerId) {
            return res.status(400).json({ error: 'Dealer selection is required as no default dealer is assigned.' });
        }

        if (stockRequest.status !== 'PENDING_ADMIN_APPROVAL') {
            // Idempotency: if already approved, just return success or info
            if (stockRequest.status === 'APPROVED') {
                return res.json({ message: 'Request already approved', dealerOrder: stockRequest.dealerOrder });
            }
            return res.status(400).json({ error: `Request status is ${stockRequest.status}` });
        }

        const finalQuantity = quantity || stockRequest.requestedQuantity;

        // Check if there is already a linked dealer order (from auto-generation)
        let dealerOrder;
        if (stockRequest.dealerOrder) {
            dealerOrder = await DealerOrder.findById(stockRequest.dealerOrder);
            if (dealerOrder) {
                // Update existing order
                dealerOrder.status = 'APPROVED';
                dealerOrder.quantity = finalQuantity;
                dealerOrder.dealer = finalDealerId; // Update dealer if changed
                await dealerOrder.save();
            }
        }

        // If no existing order, create new one
        if (!dealerOrder) {
            dealerOrder = new DealerOrder({
                dealer: finalDealerId,
                product: stockRequest.product._id,
                quantity: finalQuantity,
                status: 'APPROVED',
                stockRequestId: stockRequest._id,
                totalAmount: (stockRequest.product.price || stockRequest.product.basePrice || 0) * finalQuantity,
                paymentStatus: 'PENDING'
            });
            await dealerOrder.save();
        }

        // Update Stock Request
        stockRequest.status = 'APPROVED';
        stockRequest.approvedQuantity = finalQuantity;
        stockRequest.dealerOrder = dealerOrder._id;
        await stockRequest.save();

        // Update Dealer assignment int he product for future reference
        await Product.findByIdAndUpdate(stockRequest.product._id, { dealer: dealerId });

        res.json({ message: 'Stock request approved and order sent to dealer', dealerOrder });
    } catch (error) {
        console.error('Approve Stock Request Error:', error);
        res.status(500).json({ error: 'Failed to approve request' });
    }
});

// REJECT Stock Request
router.post('/reject-request/:requestId', verifyAdmin, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { reason } = req.body;

        const stockRequest = await StockRequest.findByIdAndUpdate(
            requestId,
            { status: 'REJECTED', adminNote: reason },
            { new: true }
        );

        if (!stockRequest) return res.status(404).json({ error: 'Request not found' });

        res.json({ message: 'Stock request rejected', stockRequest });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject request' });
    }
});

// CONFIRM RECEIPT (Admin receives stock)
router.post('/confirm-receipt/:requestId', verifyAdmin, async (req, res) => {
    try {
        const { requestId } = req.params;

        const stockRequest = await StockRequest.findById(requestId).populate('dealerOrder');
        if (!stockRequest) return res.status(404).json({ error: 'Request not found' });

        if (!stockRequest.dealerOrder) {
            return res.status(400).json({ error: 'No dealer order linked to this request' });
        }

        const dealerOrder = await DealerOrder.findById(stockRequest.dealerOrder._id);
        if (dealerOrder.status === 'COMPLETED') {
            return res.status(400).json({ error: 'Order already completed and stock updated' });
        }

        // Update Product Stock
        await Product.findByIdAndUpdate(stockRequest.product, {
            $inc: { stock: dealerOrder.quantity }
        });

        // Update Order Status
        dealerOrder.status = 'COMPLETED';
        dealerOrder.deliveryDate = Date.now();
        dealerOrder.paymentStatus = 'PAID'; // Auto-pay on delivery (COD)
        dealerOrder.paymentMethod = 'COD';
        dealerOrder.paymentId = `COD-${Date.now()}`;
        dealerOrder.transactionDate = Date.now();
        await dealerOrder.save();

        // Resolve Stock Alert
        const StockAlert = require('../models/StockAlert');
        await StockAlert.findOneAndUpdate(
            { dealerOrder: dealerOrder._id },
            { status: 'RESOLVED' }
        );

        res.json({ message: 'Stock received and inventory updated', dealerOrder });
    } catch (error) {
        console.error('Confirm Receipt Error:', error);
        res.status(500).json({ error: 'Failed to confirm receipt' });
    }
});

// PAY DEALER (Admin pays for completed order)
router.post('/pay-dealer/:orderId', verifyAdmin, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentMethod, transactionId } = req.body; // metadata

        const dealerOrder = await DealerOrder.findById(orderId).populate('dealer');
        if (!dealerOrder) return res.status(404).json({ error: 'Order not found' });

        if (dealerOrder.status !== 'COMPLETED') {
            return res.status(400).json({ error: 'Order must be COMPLETED (Received) before payment' });
        }

        if (dealerOrder.paymentStatus === 'PAID') {
            return res.json({ message: 'Order is already paid', dealerOrder });
        }

        // Simulate Payment Processing
        dealerOrder.paymentStatus = 'PAID';
        dealerOrder.paymentMethod = 'COD'; // Enforce COD
        dealerOrder.paymentId = transactionId || `COD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        dealerOrder.transactionDate = Date.now();

        await dealerOrder.save();

        res.json({ message: 'Payment recorded successfully', dealerOrder });
    } catch (error) {
        console.error('Payment Error:', error);
        res.status(500).json({ error: 'Failed to process payment' });
    }
});

// Add new Dealer
router.post('/dealers', verifyAdmin, async (req, res) => {
    try {
        const { name, email, password, phone, address, suppliedCategory } = req.body;

        // Check if dealer exists
        const existingDealer = await Dealer.findOne({ email });
        if (existingDealer) {
            return res.status(400).json({ error: 'Dealer with this email already exists' });
        }

        // Hash password (using bcryptjs which should be installed as per context)
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newDealer = new Dealer({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            suppliedCategory
        });

        await newDealer.save();
        res.status(201).json({ message: 'Dealer created successfully', dealer: { _id: newDealer._id, name: newDealer.name, email: newDealer.email } });
    } catch (error) {
        console.error('Error creating dealer:', error);
        res.status(500).json({ error: 'Failed to create dealer' });
    }
});

// Delete Dealer
router.delete('/dealers/:id', verifyAdmin, async (req, res) => {
    try {
        const result = await Dealer.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ error: 'Dealer not found' });
        res.json({ message: 'Dealer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete dealer' });
    }
});

// Toggle Dealer Status
router.patch('/dealers/:id/status', verifyAdmin, async (req, res) => {
    try {
        const dealer = await Dealer.findById(req.params.id);
        if (!dealer) return res.status(404).json({ error: 'Dealer not found' });

        dealer.status = dealer.status === 'active' ? 'inactive' : 'active';
        await dealer.save();
        res.json({ message: `Dealer marked as ${dealer.status}`, status: dealer.status });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update dealer status' });
    }
});


module.exports = router;
