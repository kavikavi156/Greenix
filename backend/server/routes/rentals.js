const express = require('express');
const router = express.Router();
const RentalBooking = require('../models/RentalBooking');
const RentalEquipment = require('../models/RentalEquipment');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyId',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourKeySecret'
});



// Hardcoded list for initial seeding
const INITIAL_EQUIPMENT = [
    {
        name: 'Mahindra 575 DI Tractor',
        category: 'Tractor',
        image: 'https://images.unsplash.com/photo-1592860523458-941926674681?q=80&w=1000&auto=format&fit=crop',
        pricePerDay: 1200,
        features: ['50 HP Engine', 'Power Steering', 'High Fuel Efficiency'],
        stock: 5,
        description: 'Powerful 50HP tractor suitable for all major farming operations including ploughing, rotavating, and haulage.'
    },
    {
        name: 'Standard Combine Harvester',
        category: 'Harvester',
        image: 'https://images.unsplash.com/photo-1530260626688-d48233003fe9?q=80&w=1000&auto=format&fit=crop',
        pricePerDay: 4500,
        features: ['Multi-crop harvesting', 'AC Cabin', 'High Grain Cleanliness'],
        stock: 2,
        description: 'Efficient combine harvester for wheat, paddy, and soybean. Reduces labor cost and time.'
    },
    {
        name: 'AgriDrone Pro Sprayer',
        category: 'Drone',
        image: 'https://images.unsplash.com/photo-1508614589041-895b8f9e8784?q=80&w=1000&auto=format&fit=crop',
        pricePerDay: 2500,
        features: ['10L Tank', 'Auto-Pilot', '10 min/acre coverage'],
        stock: 8,
        description: 'Advanced agricultural drone for precision pesticide and fertilizer spraying. Saves chemicals and time.'
    },
    {
        name: 'Heavy Duty Rotavator (6ft)',
        category: 'Implements',
        image: 'https://tiimg.tistatic.com/fp/1/007/574/heavy-duty-multispeed-rotavator-6-feet-768.jpg',
        pricePerDay: 800,
        features: ['Multi-speed Gearbox', 'Heavy Duty Blades', 'Soil Pulverization'],
        stock: 10,
        description: 'Best for preparing seedbeds. Breaks down soil clods effectively.'
    },
    {
        name: 'Solar Water Pump Set',
        category: 'Irrigation',
        image: 'https://5.imimg.com/data5/SELLER/Default/2023/1/YI/WO/XU/3642759/5hp-solar-water-pump.jpg',
        pricePerDay: 500,
        features: ['5HP Motor', 'Solar Powered', 'Portable'],
        stock: 15,
        description: 'Eco-friendly water pump for irrigation in areas with irregular electricity.'
    }
];

// Seed DB if empty
(async () => {
    try {
        const count = await RentalEquipment.countDocuments();
        if (count === 0) {
            console.log('Seeding rental equipment...');
            await RentalEquipment.insertMany(INITIAL_EQUIPMENT);
            console.log('Rental equipment seeded successfully.');
        }
    } catch (err) {
        console.error('Failed to seed rental equipment:', err);
    }
})();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Middleware for Admin
const verifyAdminToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        if (decoded.role !== 'admin') throw new Error('Not admin');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Admin access required' });
    }
};

// GET all rental equipment with availability status
router.get('/', async (req, res) => {
    try {
        const equipment = await RentalEquipment.find({ status: 'active' });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch all active/confirmed bookings that end on or after today
        const activeBookings = await RentalBooking.find({
            status: { $in: ['confirmed', 'active'] },
            endDate: { $gte: today }
        });

        const mapped = equipment.map(e => {
            const item = e.toObject();
            item.id = e._id;

            // Find bookings for this specific equipment
            const equipmentBookings = activeBookings.filter(b =>
                b.equipmentId.toString() === item._id.toString()
            );

            // Check if currently booked (today falls within booking range)
            // We compare timestamps to be safe
            const currentBooking = equipmentBookings.find(b => {
                const start = new Date(b.startDate);
                const end = new Date(b.endDate);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return today >= start && today <= end;
            });

            if (currentBooking) {
                item.isBooked = true;

                // Determine next available date
                // We find the latest end date of the contiguous block of bookings starting from now
                // For simplicity V1: Just take the end date of the current booking
                const endDate = new Date(currentBooking.endDate);
                const nextDate = new Date(endDate);
                nextDate.setDate(nextDate.getDate() + 1);
                item.nextAvailableDate = nextDate;
            } else {
                item.isBooked = false;
                item.nextAvailableDate = null; // Available now
            }

            return item;
        });

        res.json({ success: true, equipment: mapped });
    } catch (error) {
        console.error('Error fetching rentals:', error);
        res.status(500).json({ error: 'Failed to fetch equipment' });
    }
});

// GET user's bookings — MUST be before /:id to avoid route conflict
router.get('/my-bookings', verifyToken, async (req, res) => {
    try {
        const bookings = await RentalBooking.find({ user: req.userId }).sort({ bookingDate: -1 });
        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// GET single equipment details
router.get('/:id', async (req, res) => {
    try {
        const item = await RentalEquipment.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Equipment not found' });
        res.json({ success: true, item: { ...item.toObject(), id: item._id } });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch equipment details' });
    }
});

// POST Create a booking
router.post('/book', verifyToken, async (req, res) => {
    try {
        const { equipmentId, startDate, endDate, deliveryAddress } = req.body;

        // Validate equipment
        const equipment = await RentalEquipment.findById(equipmentId);
        if (!equipment) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }

        if (start < new Date()) {
            return res.status(400).json({ error: 'Cannot book in the past' });
        }

        // Check for overlapping bookings
        const existingBooking = await RentalBooking.findOne({
            equipmentId: equipment._id,
            status: { $ne: 'cancelled' },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        });

        if (existingBooking) {
            return res.status(400).json({ error: 'Equipment is already booked for these dates' });
        }

        const diffTime = Math.abs(end - start);
        let duration;
        const unit = equipment.pricingUnit || 'day';

        if (unit === 'hour') {
            duration = Math.ceil(diffTime / (1000 * 60 * 60)); // Hours
        } else if (unit === 'week') {
            duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)); // Weeks
        } else if (unit === 'month') {
            // Approximate month calculation (30 days)
            duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
        } else {
            duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Days (Default)
        }

        // Ensure at least 1 unit
        const quantity = duration > 0 ? duration : 1;
        const rentalCost = quantity * equipment.pricePerDay; // pricePerDay stores the unit price
        const platformFee = Math.round(rentalCost * 0.10); // 10% commission
        const securityDeposit = 5000; // Fixed deposit

        const totalCost = rentalCost + platformFee + securityDeposit;

        // Create Razorpay Order
        const options = {
            amount: totalCost * 100, // amount in paise
            currency: 'INR',
            receipt: `rental_rcpt_${Date.now()}_${req.userId.substring(0, 5)}`,
        };

        const order = await razorpay.orders.create(options);

        const booking = new RentalBooking({
            user: req.userId,
            equipmentId: equipment._id,
            equipmentName: equipment.name,
            image: equipment.image,
            startDate: start,
            endDate: end,
            totalDays: quantity,          // ✅ Fixed: was undefined variable
            pricingUnit: unit,            // ✅ Added: store unit for correct receipts
            pricePerDay: equipment.pricePerDay,
            totalCost,
            deliveryAddress,
            status: 'pending',
            paymentDetails: {
                razorpayOrderId: order.id
            }
        });

        await booking.save();

        res.status(201).json({
            success: true,
            message: 'Booking initialized',
            bookingId: booking._id,
            totalCost,
            razorpayOrderId: order.id,
            key: process.env.RAZORPAY_KEY_ID,
            booking
        });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// POST Verify Payment
router.post('/verify-payment', verifyToken, async (req, res) => {
    try {
        const { bookingId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        const booking = await RentalBooking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YourKeySecret')
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            // Payment verified
            booking.status = 'confirmed';
            booking.paymentDetails = {
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature
            };
            await booking.save();

            res.json({
                success: true,
                message: 'Payment verified and booking confirmed',
                booking
            });
        } else {
            res.status(400).json({ error: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
});

// NOTE: /my-bookings moved above /:id to prevent route shadowing

// PUT Cancel a booking (Customer — only pending/confirmed)
router.put('/cancel/:id', verifyToken, async (req, res) => {
    try {
        const booking = await RentalBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        // Only the booking owner can cancel
        if (booking.user.toString() !== req.userId.toString()) {
            return res.status(403).json({ error: 'Not authorized to cancel this booking' });
        }

        if (!['pending', 'confirmed'].includes(booking.status)) {
            return res.status(400).json({ error: `Cannot cancel a booking with status: ${booking.status}` });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({ success: true, message: 'Booking cancelled successfully', booking });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
});

// --- ADMIN ROUTES ---

// GET All Bookings (Admin)
router.get('/admin/all-bookings', verifyAdminToken, async (req, res) => {
    try {
        const bookings = await RentalBooking.find()
            .populate('user', 'name email mobile')
            .sort({ bookingDate: -1 });
        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch all bookings' });
    }
});

// Update Booking Status (Admin)
router.put('/admin/update-status/:id', verifyAdminToken, async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await RentalBooking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// GET All Equipment (Admin - including inactive)
router.get('/admin/equipment', verifyAdminToken, async (req, res) => {
    try {
        const equipment = await RentalEquipment.find().sort({ createdAt: -1 });
        res.json({ success: true, equipment: equipment.map(e => ({ ...e.toObject(), id: e._id })) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch equipment list' });
    }
});

// POST Create Equipment (Admin)
router.post('/admin/equipment', verifyAdminToken, async (req, res) => {
    try {
        const newEquipment = new RentalEquipment(req.body);
        await newEquipment.save();
        res.status(201).json({ success: true, equipment: newEquipment });
    } catch (error) {
        console.error('Create equipment error:', error);
        res.status(500).json({ error: 'Failed to create equipment' });
    }
});

// PUT Update Equipment (Admin)
router.put('/admin/equipment/:id', verifyAdminToken, async (req, res) => {
    try {
        const updatedEquipment = await RentalEquipment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedEquipment) return res.status(404).json({ error: 'Equipment not found' });
        res.json({ success: true, equipment: updatedEquipment });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update equipment' });
    }
});

// DELETE Equipment (Admin)
router.delete('/admin/equipment/:id', verifyAdminToken, async (req, res) => {
    try {
        await RentalEquipment.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Equipment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete equipment' });
    }
});

module.exports = router;
