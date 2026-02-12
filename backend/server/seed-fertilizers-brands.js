const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Reusing existing images logic
const EXISTING_IMAGES = [
    'product-1755924187918-529152160.jpeg',
    'product-1755924232164-863084415.jpeg',
    'product-1755924750679-341355297.jpeg',
    'product-1756280710437-264314113.jpeg'
];

const getRandomImage = () => `uploads/${EXISTING_IMAGES[Math.floor(Math.random() * EXISTING_IMAGES.length)]}`;

async function seedFertilizers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pavithratraders');
        console.log('Connected to MongoDB');

        const newProducts = [
            {
                name: 'Gromor 28-28-0',
                description: 'Complex fertilizer containing Nitrogen and Phosphorus in equal ratio.',
                brand: 'Coromandel International Ltd',
                category: 'Fertilizers',
                price: 1450,
                basePrice: 1450,
                stock: 50,
                unit: 'bags_50kg',
                lowStockThreshold: 10,
                tags: ['fertilizer', 'coromandel', 'npk']
            },
            {
                name: 'Gromor 14-35-14',
                description: 'High Phosphorus complex fertilizer suitable for basal application.',
                brand: 'Coromandel International Ltd',
                category: 'Fertilizers',
                price: 1600,
                basePrice: 1600,
                stock: 40,
                unit: 'bags_50kg',
                lowStockThreshold: 10,
                tags: ['fertilizer', 'coromandel']
            },
            {
                name: 'Vijay Urea',
                description: 'High quality technical grade urea.',
                brand: 'Madras Fertilizers Ltd',
                category: 'Fertilizers',
                price: 266,
                basePrice: 266,
                stock: 100,
                unit: 'bags_45kg',
                lowStockThreshold: 10,
                tags: ['fertilizer', 'urea', 'madras']
            },
            {
                name: 'Vijay 17-17-17',
                description: 'Balanced complex fertilizer for all crops.',
                brand: 'Madras Fertilizers Ltd',
                category: 'Fertilizers',
                price: 1300,
                basePrice: 1300,
                stock: 60,
                unit: 'bags_50kg',
                lowStockThreshold: 10,
                tags: ['fertilizer', 'npk', 'madras']
            },
            {
                name: 'Factamfos 20-20-0-13',
                description: 'Ammonium Phosphate Sulphate, containing Sulphur.',
                brand: 'The Fertilisers and Chemicals Travancore Ltd (FACT)',
                category: 'Fertilizers',
                price: 1350,
                basePrice: 1350,
                stock: 75,
                unit: 'bags_50kg',
                lowStockThreshold: 10,
                tags: ['fertilizer', 'fact', 'sulphur']
            },
            {
                name: 'FACT Zincated Factamfos',
                description: 'Fortified with Zinc for better yield.',
                brand: 'The Fertilisers and Chemicals Travancore Ltd (FACT)',
                category: 'Fertilizers',
                price: 1400,
                basePrice: 1400,
                stock: 30,
                unit: 'bags_50kg',
                lowStockThreshold: 10,
                tags: ['fertilizer', 'fact', 'zinc']
            }
        ];

        for (const p of newProducts) {
            p.image = getRandomImage();

            const exists = await Product.findOne({ name: p.name });
            if (exists) {
                console.log(`Updating ${p.name}`);
                exists.brand = p.brand; // Ensure brand matches exactly
                exists.stock = p.stock;
                await exists.save();
            } else {
                console.log(`Creating ${p.name}`);
                await new Product(p).save();
            }
        }

        console.log('✅ Specific Fertilizer Brands seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seedFertilizers();
