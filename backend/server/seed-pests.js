const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const dir = path.join(__dirname, '..', '..', 'frontend', 'src', 'components', 'pest');

async function correctSeeding() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pavithratraders');
        console.log('Connected to DB');

        // Accurate mapping mapped precisely from the image analysis
        const accurateDataMap = {
            "dfghj.jpeg": { name: "Dr. Bacto's Zeromite Bio Pesticide", brand: "Dr. Bacto's", price: 650, category: "Pesticides", unit: "bottles" },
            "dfghjk.jpeg": { name: "Amruth Almax Beauveria sp.", brand: "Amruth Organic", price: 420, category: "Pesticides", unit: "bottles" },
            "download (5).jpeg": { name: "Pest Fix Herbal & Plant Extracts", brand: "Exfert", price: 380, category: "Pesticides", unit: "bottles" },
            "download.jpeg": { name: "ACCON+ Bio Pesticide", brand: "Cropex", price: 550, category: "Pesticides", unit: "bottles" },
            "hgh.jpeg": { name: "Fenny Bifenthrin 10% EC", brand: "Tropical Agrosystem", price: 700, category: "Pesticides", unit: "bottles" }
        };

        const images = fs.readdirSync(dir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));

        for (const file of images) {
            const productInfo = accurateDataMap[file];
            
            if (!productInfo) {
                console.warn(`No mapping found for ${file}`);
                continue;
            }

            const safeFileName = file.replace(/[^a-zA-Z0-9.\-]/g, '_');
            const destFileName = `real-pest-${Date.now()}-${safeFileName}`;
            const destPath = path.join(__dirname, 'uploads', destFileName);
            
            // copy file to uploads
            fs.copyFileSync(path.join(dir, file), destPath);

            const productName = productInfo.name;

            const exists = await Product.findOne({ name: productName });
            if (!exists) {
                const p = new Product({
                    name: productName,
                    description: `High-quality ${productInfo.category.toLowerCase()} from ${productInfo.brand}. Designed to protect your crops effectively and efficiently from unwanted pests.`,
                    brand: productInfo.brand,
                    category: productInfo.category,
                    price: productInfo.price,
                    basePrice: productInfo.price,
                    unit: productInfo.unit,
                    stock: Math.floor(Math.random() * 50) + 20,
                    lowStockThreshold: 10,
                    image: `uploads/${destFileName}`,
                    tags: ['pesticide', 'crop-protection', productInfo.brand.toLowerCase()]
                });
                await p.save();
                console.log(`✅ Created accurate product: ${p.name} from ${file}`);
            } else {
                console.log(`ℹ️ Accurate Product already exists: ${exists.name}`);
            }
        }
        console.log('🎉 Done correctly mapping and adding pesticide images from the folder!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

correctSeeding();
