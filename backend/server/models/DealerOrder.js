const mongoose = require('mongoose');

const dealerOrderSchema = new mongoose.Schema({
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['PENDING_ADMIN_APPROVAL', 'APPROVED', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REJECTED'],
        default: 'PENDING_ADMIN_APPROVAL'
    },
    stockRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'StockRequest' }, // Link back if applicable
    deliveryDate: { type: Date },
    notes: { type: String },

    // Payment Fields
    totalAmount: { type: Number }, // Calculated at approval: product.price * quantity
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED'],
        default: 'PENDING'
    },
    paymentId: { type: String }, // Transaction ID (Simulated or Real)
    paymentMethod: { type: String, enum: ['COD'], default: 'COD' },
    transactionDate: { type: Date }
}, {
    timestamps: true
});

module.exports = mongoose.model('DealerOrder', dealerOrderSchema);
