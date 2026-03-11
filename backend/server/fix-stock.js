const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

async function fixNegativeStock() {
    try {
        await mongoose.connect('mongodb://localhost:27017/pavithratraders'); // Correct DB name
        console.log('Connected to MongoDB');

        const result = await Product.updateMany(
            { stock: { $lt: 0 } },
            { $set: { stock: 0 } }
        );

        console.log(`Updated ${result.modifiedCount} products with negative stock.`);

        const prebookedResult = await Product.updateMany(
            { prebooked: { $lt: 0 } },
            { $set: { prebooked: 0 } }
        );

        console.log(`Updated ${prebookedResult.modifiedCount} products with negative prebooked values.`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error fixing negative stock:', error);
    }
}

fixNegativeStock();
