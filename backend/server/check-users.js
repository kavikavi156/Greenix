const mongoose = require('mongoose');
const Dealer = require('./models/Dealer');
const Admin = require('./models/Admin');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pavithratraders';

async function checkCredentials() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const admins = await Admin.find({});
        console.log('--- ADMINS ---');
        if (admins.length === 0) {
            console.log('No admins found.');
        } else {
            admins.forEach(a => {
                console.log(`Email: ${a.email}, Name: ${a.name} (Password is hashed)`);
                // Check for common default password hashes if possible, or just list the email
            });
        }

        const dealers = await Dealer.find({});
        console.log('\n--- DEALERS ---');
        if (dealers.length === 0) {
            console.log('No dealers found.');
        } else {
            dealers.forEach(d => {
                console.log(`Email: ${d.email}, Name: ${d.name} (Password is hashed)`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkCredentials();
