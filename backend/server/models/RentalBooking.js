const mongoose = require('mongoose');

const rentalBookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    equipmentId: {
        type: String,
        required: true
    },
    equipmentName: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalDays: {
        type: Number,
        required: true
    },
    pricePerDay: {
        type: Number,
        required: true
    },
    pricingUnit: {
        type: String,
        enum: ['hour', 'day', 'week', 'month'],
        default: 'day'
    },
    totalCost: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'confirmed'
    },
    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    paymentDetails: {
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String
    }
});

module.exports = mongoose.model('RentalBooking', rentalBookingSchema);
