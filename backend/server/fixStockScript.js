const mongoose = require('mongoose');
const Product = require('./models/Product');

async function fixNegativeStock() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/greenixx', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to DB');

        const res = await Product.updateMany(
            { stock: { $lt: 0 } },
            { $set: { stock: 0 } }
        );

        console.log('Fixed negative stock products:', res);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

fixNegativeStock();
