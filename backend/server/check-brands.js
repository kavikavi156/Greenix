const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function checkFertilizerBrands() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pavithratraders');
        console.log('Connected to MongoDB');

        const fertilizers = await Product.find({ category: 'Fertilizers' });
        const brands = [...new Set(fertilizers.map(p => p.brand))];

        console.log('Current Fertilizer Brands:', brands);

        const targetBrands = [
            'Coromandel International Ltd',
            'Madras Fertilizers Ltd',
            'FACT' // Using FACT as short for The Fertilisers and Chemicals Travancore Ltd
        ];

        console.log('Target Brands to Ensure:', targetBrands);

        // Update some existing fertilizers to use these brands for demonstration
        // Or add new products if needed.

        // Let's update a few randomly to these brands if they don't exist
        if (fertilizers.length > 0) {
            for (let i = 0; i < fertilizers.length; i++) {
                // Distribute target brands among existing fertilizers
                const targetBrand = targetBrands[i % targetBrands.length];

                // Only update if brand is generic or placeholder
                if (['Generic', 'IFFCO', 'IPL', 'Coromandel'].includes(fertilizers[i].brand)) {
                    fertilizers[i].brand = targetBrand;
                    await fertilizers[i].save();
                    console.log(`Updated ${fertilizers[i].name} to brand ${targetBrand}`);
                }
            }
        }

        console.log('✅ Fertilizer brands updated.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkFertilizerBrands();
