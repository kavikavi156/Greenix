require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Dealer = require('./models/Dealer');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pavithratraders';

async function seedRoles() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Create Admin
        const adminEmail = 'admin@greenix.com';
        const adminPassword = 'admin123'; // Secure enough for dev

        let admin = await Admin.findOne({ email: adminEmail });
        if (!admin) {
            console.log('Creating Admin...');
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            admin = new Admin({
                name: 'Super Admin',
                email: adminEmail,
                password: hashedPassword,
                phone: '1234567890',
                role: 'admin'
            });
            await admin.save();
            console.log(`Admin created: ${adminEmail} / ${adminPassword}`);
        } else {
            console.log('Admin already exists.');
        }

        // 2. Create Dealer
        const dealerEmail = 'dealer@greenix.com';
        const dealerPassword = 'dealer123';

        let dealer = await Dealer.findOne({ email: dealerEmail });
        if (!dealer) {
            console.log('Creating Dealer...');
            const hashedPassword = await bcrypt.hash(dealerPassword, 10);
            dealer = new Dealer({
                name: 'John Dealer',
                email: dealerEmail,
                password: hashedPassword,
                phone: '9876543210',
                role: 'dealer',
                address: {
                    street: '123 Farm Road',
                    city: 'Agri City',
                    state: 'State',
                    pincode: '123456'
                },
                status: 'active'
            });
            await dealer.save();
            console.log(`Dealer created: ${dealerEmail} / ${dealerPassword}`);
        } else {
            console.log('Dealer already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding roles:', error);
        process.exit(1);
    }
}

seedRoles();
