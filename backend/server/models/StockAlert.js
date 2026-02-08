const mongoose = require('mongoose');

const stockAlertSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    currentStock: { type: Number, required: true },
    minimumStock: { type: Number, required: true },
    status: {
        type: String,
        enum: ['ACTIVE', 'RESOLVED', 'IGNORED'],
        default: 'ACTIVE'
    },
    dealerOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'DealerOrder' }, // Linked auto-created order
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StockAlert', stockAlertSchema);
