const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const dir = path.join(__dirname, '..', '..', 'frontend', 'src', 'components', 'Image');

async function seed() {
    try {
        const images = fs.readdirSync(dir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));
        
        const dummyData = [
            { name: "High-Yield Tomato Seeds", brand: "AgriSeeds", price: 150, category: "Seeds" },
            { name: "Broad Spectrum Pesticide", brand: "Bayer", price: 650, category: "Pesticides" },
            { name: "Organic Carrot Seeds", brand: "EcoGrow", price: 90, category: "Seeds" },
            { name: "Neem Oil Insecticide", brand: "EcoGrow", price: 250, category: "Pesticides" },
            { name: "Hybrid Corn Seeds", brand: "Pioneer", price: 850, category: "Seeds" },
            { name: "Systemic Fungicide", brand: "Syngenta", price: 950, category: "Pesticides" },
            { name: "Premium Wheat Seeds", brand: "AgriTech", price: 1100, category: "Seeds" },
            { name: "Weed Control Herbicide", brand: "Monsanto", price: 1200, category: "Pesticides" },
            { name: "Cucumber F1 Hybrid Seeds", brand: "AgriTech", price: 120, category: "Seeds" },
            { name: "Contact Insecticide", brand: "Coromandel", price: 400, category: "Pesticides" },
            { name: "Organic Spinach Seeds", brand: "BioTech", price: 80, category: "Seeds" },
            { name: "Termite Control Solution", brand: "Bayer", price: 850, category: "Pesticides" },
            { name: "Hybrid Watermelon Seeds", brand: "Namdhari", price: 300, category: "Seeds" },
            { name: "Bio-Pesticide Combo", brand: "EcoGrow", price: 550, category: "Pesticides" },
            { name: "Cotton Seeds BG-II", brand: "Mahyco", price: 1500, category: "Seeds" },
            { name: "Ant and Roach Killer", brand: "Syngenta", price: 200, category: "Pesticides" },
            { name: "Sunflower Hybrid Seeds", brand: "Pioneer", price: 600, category: "Seeds" }
        ];

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pavithratraders');
        console.log('Connected to DB');

        for (let i = 0; i < images.length; i++) {
            const file = images[i];
            const productInfo = dummyData[i % dummyData.length];
            
            // Clean filename to prevent spaces/special chars from breaking URLs easily
            const safeFileName = file.replace(/[^a-zA-Z0-9.\-]/g, '_');
            const destFileName = `user-added-seeds-pesticides-${Date.now()}-${safeFileName}`;
            const destPath = path.join(__dirname, 'uploads', destFileName);
            
            // copy file
            fs.copyFileSync(path.join(dir, file), destPath);

            const productName = `${productInfo.name} - Premium Edition`;

            const exists = await Product.findOne({ name: productName });
            if (!exists) {
                const p = new Product({
                    name: productName,
                    description: `Premium quality ${productInfo.category.toLowerCase()} perfect for your farming needs. Buy the best brand: ${productInfo.brand}.`,
                    brand: productInfo.brand,
                    category: productInfo.category,
                    price: productInfo.price,
                    basePrice: productInfo.price,
                    unit: productInfo.category === 'Seeds' ? 'packets' : 'bottles',
                    stock: Math.floor(Math.random() * 50) + 20,
                    lowStockThreshold: 10,
                    image: `uploads/${destFileName}`,
                    tags: [productInfo.category.toLowerCase(), 'premium', 'high-yield', productInfo.brand.toLowerCase()]
                });
                await p.save();
                console.log(`✅ Created product: ${p.name}`);
            } else {
                console.log(`ℹ️ Product already exists: ${exists.name}`);
            }
        }
        console.log('🎉 Done adding user products (Seeds & Pesticides)!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seed();
