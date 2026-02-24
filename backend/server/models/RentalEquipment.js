const mongoose = require('mongoose');

const rentalEquipmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Tractor', 'Harvester', 'Drone', 'Implements', 'Irrigation', 'Other']
    },
    image: {
        type: String,
        required: true
    },
    pricePerDay: {
        type: Number,
        required: true,
        min: 0
    },
    pricingUnit: {
        type: String,
        enum: ['hour', 'day', 'week', 'month'],
        default: 'day'
    },
    features: [{
        type: String
    }],
    stock: {
        type: Number,
        default: 1,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'maintenance', 'retired'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('RentalEquipment', rentalEquipmentSchema);
