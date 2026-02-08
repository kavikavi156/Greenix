const mongoose = require('mongoose');
const DealerOrder = require('./models/DealerOrder');
const Dealer = require('./models/Dealer');
const fs = require('fs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pavithratraders';

async function debugOrders() {
    let output = '';
    const log = (msg) => { console.log(msg); output += msg + '\n'; };

    try {
        await mongoose.connect(MONGODB_URI);
        log('Connected to MongoDB');

        log('\n--- DEALERS ---');
        const dealers = await Dealer.find();
        dealers.forEach(d => {
            log(`ID: ${d._id} | Name: ${d.name} | Email: ${d.email}`);
        });

        log('\n--- LAST 5 DEALER ORDERS ---');
        const orders = await DealerOrder.find().sort({ createdAt: -1 }).limit(5).populate('dealer');
        orders.forEach(o => {
            log(`Order ID: ${o._id}`);
            log(`  Assigned Dealer: ${o.dealer ? `${o.dealer.name} (${o.dealer._id})` : 'NULL/UNLINKED'}`);
            log(`  Status: ${o.status}`);
            log(`  Product: ${o.product}`);
            log(`  Created: ${o.createdAt}`);
        });

        fs.writeFileSync('debug_output.txt', output);

    } catch (error) {
        log('Error: ' + error);
        fs.writeFileSync('debug_output.txt', output + '\nError: ' + error);
    } finally {
        await mongoose.connection.close();
    }
}

debugOrders();
