const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const dir = path.join(__dirname, '..', '..', 'frontend', 'src', 'components', 'Image');

async function correctSeeding() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pavithratraders');
        console.log('Connected to DB');

        // Clean up previously created dummy products to avoid cluttering with wrong mapped names
        const deleted = await Product.deleteMany({ name: { $regex: /Premium Edition|Eco-Friendly|Tomato Seeds - 1/ } });
        console.log(`Deleted ${deleted.deletedCount} old improperly mapped dummy products.`);

        // Accurate mapping mapped precisely from the image analysis
        const accurateDataMap = {
            "WhatsApp Image 2026-03-13 at 9.45.16 AM.jpeg": { name: "Abhilash Tomato Hybrid Seeds", brand: "Seminis", price: 350, category: "Seeds" },
            "WhatsApp Image 2026-03-13 at 9.45.17 AM.jpeg": { name: "PAC 751 Elite Hybrid Corn Seed", brand: "Advanta", price: 800, category: "Seeds" },
            "WhatsApp Image 2026-03-13 at 9.45.18 AM.jpeg": { name: "Indam Kuroda Carrot Seeds", brand: "Indo-American Hybrid Seeds", price: 200, category: "Seeds" },
            "esrdft.jpeg": { name: "MM9333 Maize Hybrid", brand: "TATA Dhaanya", price: 750, category: "Seeds" },
            "ftyr6.jpeg": { name: "Jawahar Carrot Super Early Nante", brand: "Nongwoo Seed India", price: 220, category: "Seeds" },
            "gfh.jpeg": { name: "Saaho (TO 3251) Tomato Hybrid Seed", brand: "Syngenta", price: 380, category: "Seeds" },
            "gfty.jpeg": { name: "DMH8255 Maize Seed", brand: "TATA Dhaanya", price: 780, category: "Seeds" },
            "ggtv.jpeg": { name: "Avira Honey Carrot Seeds", brand: "Avira Seeds", price: 180, category: "Seeds" },
            "ghgh.jpeg": { name: "Avira Honey Carrot Seeds (Bulk)", brand: "Avira Seeds", price: 1700, category: "Seeds" },
            "gyg.jpeg": { name: "Ellora Gulabi Onion Seeds", brand: "Ellora Natural Seeds", price: 250, category: "Seeds" },
            "hg.jpeg": { name: "NRS Supremo Red Onion", brand: "NRS Seeds", price: 260, category: "Seeds" },
            "hgh.jpeg": { name: "Ellora Natural Onion Seeds", brand: "Ellora Natural Seeds", price: 240, category: "Seeds" },
            "jns.jpeg": { name: "PAC 741 Hybrid Corn Seed", brand: "Advanta", price: 820, category: "Seeds" },
            "jwhbd.jpeg": { name: "RIL 901 Hybrid Maize", brand: "TATA Rallis", price: 850, category: "Seeds" },
            "nbn.jpeg": { name: "Elite Rosy F1 Hybrid Sweet Corn", brand: "Advanta", price: 400, category: "Seeds" },
            "utfy.jpeg": { name: "Saaho (TO-3251) Tomato Seeds (Large Pack)", brand: "Syngenta", price: 1500, category: "Seeds" },
            "whdb.jpeg": { name: "RIL 901 Hybrid Maize (Bundle)", brand: "TATA Rallis", price: 1600, category: "Seeds" }
        };

        const images = fs.readdirSync(dir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));

        for (const file of images) {
            const productInfo = accurateDataMap[file];
            
            if (!productInfo) {
                console.warn(`No mapping found for ${file}`);
                continue;
            }

            const safeFileName = file.replace(/[^a-zA-Z0-9.\-]/g, '_');
            const destFileName = `real-seed-${Date.now()}-${safeFileName}`;
            const destPath = path.join(__dirname, 'uploads', destFileName);
            
            // copy file to uploads
            fs.copyFileSync(path.join(dir, file), destPath);

            const productName = productInfo.name;

            const exists = await Product.findOne({ name: productName });
            if (!exists) {
                const p = new Product({
                    name: productName,
                    description: `High-quality ${productName} by ${productInfo.brand}. Perfect for professional farming and achieving high yields.`,
                    brand: productInfo.brand,
                    category: productInfo.category,
                    price: productInfo.price,
                    basePrice: productInfo.price,
                    unit: 'packets',
                    stock: Math.floor(Math.random() * 50) + 20,
                    lowStockThreshold: 10,
                    image: `uploads/${destFileName}`,
                    tags: ['seeds', productInfo.brand.toLowerCase(), 'hybrid']
                });
                await p.save();
                console.log(`✅ Created accurate product: ${p.name} from ${file}`);
            } else {
                console.log(`ℹ️ Accurate Product already exists: ${exists.name}`);
            }
        }
        console.log('🎉 Done correctly mapping and adding seed images from the folder!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

correctSeeding();
