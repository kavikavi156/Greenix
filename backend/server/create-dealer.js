const mongoose = require('mongoose');
const Dealer = require('./models/Dealer');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pavithratraders';

async function createDealer() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'dealer@greenix.com';
        const existing = await Dealer.findOne({ email });

        if (existing) {
            console.log('Dealer already exists:', existing);
            return;
        }

        const hashedPassword = await bcrypt.hash('dealer123', 10);
        const dealer = new Dealer({
            name: 'John Dealer',
            email: email,
            password: hashedPassword,
            phone: '9876543210',
            role: 'dealer',
            status: 'active',
            address: {
                street: '123 Market St',
                city: 'Agri Town',
                state: 'State',
                pincode: '123456'
            },
            suppliedCategory: 'Fertilizers'
        });

        await dealer.save();
        console.log(`✅ Dealer created: ${email} / dealer123`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

createDealer();
