const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'dealer', immutable: true },
    phone: { type: String, required: true },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    suppliedCategory: {
        type: String,
        required: true,
        enum: ['Seeds', 'Herbicides', 'Insecticides', 'Fertilizers', 'Fungicides', 'Tools', 'Equipment', 'Organic Products']
    },
    assignedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DealerOrder' }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Dealer', dealerSchema);
