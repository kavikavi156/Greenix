require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pavithratraders';

async function seedCustomer() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const customerEmail = 'customer@greenix.com';
        const password = 'customer123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if customer exists
        const existingCustomer = await User.findOne({ email: customerEmail });
        if (existingCustomer) {
            console.log('Customer already exists');
            process.exit(0);
        }

        const newCustomer = new User({
            name: 'John Customer',
            email: customerEmail,
            username: 'customer123',
            password: hashedPassword,
            phone: '9876554321',
            role: 'customer',
            address: {
                street: '456 Garden Lane',
                city: 'Harvest Town',
                state: 'State',
                pincode: '654321',
                phone: '9876554321'
            }
        });

        await newCustomer.save();
        console.log(`✅ Customer created successfully!`);
        console.log(`📧 Email: ${customerEmail}`);
        console.log(`👤 Username: customer123`);
        console.log(`🔑 Password: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding customer:', error);
        process.exit(1);
    }
}

seedCustomer();
