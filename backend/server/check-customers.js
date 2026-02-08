const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pavithratraders';

async function checkCustomers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const customers = await User.find({ role: 'user' }); // Assuming default role is 'user' for customers
        console.log('--- CUSTOMERS ---');
        if (customers.length === 0) {
            console.log('No customers found.');
        } else {
            customers.forEach(c => {
                console.log(`Username: ${c.username}, Email: ${c.email} (Password is hashed)`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkCustomers();
