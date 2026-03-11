const mongoose = require('mongoose');

const stockRequestSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    currentStock: { type: Number, required: true },
    requestedQuantity: { type: Number, required: true }, // Default matches reorderQuantity
    status: {
        type: String,
        enum: ['PENDING_ADMIN_APPROVAL', 'APPROVED', 'REJECTED', 'COMPLETED'],
        default: 'PENDING_ADMIN_APPROVAL'
    },
    adminNote: { type: String }, // Optional reason for rejection or modification
    approvedQuantity: { type: Number }, // If modified by admin
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer' }, // Dealer who made the request (optional, can be admin generated)
    dealerOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'DealerOrder' },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('StockRequest', stockRequestSchema);
