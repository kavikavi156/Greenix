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
            { name: "Eco-Friendly Organic Compost", brand: "EcoGrow", price: 450, category: "Organic Products" },
            { name: "Super NPK 19-19-19", brand: "AgriTech", price: 1250, category: "Fertilizers" },
            { name: "Premium Bone Meal", brand: "BioTech", price: 300, category: "Organic Products" },
            { name: "Liquid Seaweed Extract", brand: "OceanGrow", price: 550, category: "Organic Products" },
            { name: "Urea 46%", brand: "Coromandel International Ltd", price: 270, category: "Fertilizers" },
            { name: "Ammonium Sulphate", brand: "FACT", price: 650, category: "Fertilizers" },
            { name: "Neem Cake Organic", brand: "EcoGrow", price: 200, category: "Organic Products" },
            { name: "Potash MOP", brand: "AgriTech", price: 800, category: "Fertilizers" },
            { name: "DAP 18-46-0", brand: "Coromandel International Ltd", price: 1200, category: "Fertilizers" },
            { name: "Zinc Sulphate", brand: "AgriTech", price: 400, category: "Fertilizers" },
            { name: "Vermicompost Premium", brand: "EcoGrow", price: 150, category: "Organic Products" },
            { name: "Micronutrient Mix", brand: "BioTech", price: 750, category: "Fertilizers" },
            { name: "Bio-Fertilizer Azotobacter", brand: "EcoGrow", price: 350, category: "Organic Products" },
            { name: "Calcium Nitrate", brand: "AgriTech", price: 900, category: "Fertilizers" },
            { name: "Magnesium Sulphate", brand: "FACT", price: 500, category: "Fertilizers" },
            { name: "Sulphur 90% WDG", brand: "BioTech", price: 850, category: "Fertilizers" },
            { name: "Water Soluble NPK 20-20-20", brand: "Coromandel International Ltd", price: 1400, category: "Fertilizers" }
        ];

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pavithratraders');
        console.log('Connected to DB');

        for (let i = 0; i < images.length; i++) {
            const file = images[i];
            const productInfo = dummyData[i % dummyData.length];
            
            // Clean filename to prevent spaces/special chars from breaking URLs easily
            const safeFileName = file.replace(/[^a-zA-Z0-9.\-]/g, '_');
            const destFileName = `user-added-${Date.now()}-${safeFileName}`;
            const destPath = path.join(__dirname, 'uploads', destFileName);
            
            // copy file
            fs.copyFileSync(path.join(dir, file), destPath);

            const productName = `${productInfo.name} - ${i + 1}`;

            const exists = await Product.findOne({ name: productName });
            if (!exists) {
                const p = new Product({
                    name: productName,
                    description: `Premium quality ${productInfo.name} to maximize your crop yields. This fertilizer ensures healthy roots, resilient plants, and significantly improved soil structure.`,
                    brand: productInfo.brand,
                    category: productInfo.category,
                    price: productInfo.price,
                    basePrice: productInfo.price,
                    unit: 'bags',
                    stock: Math.floor(Math.random() * 50) + 10,
                    lowStockThreshold: 10,
                    image: `uploads/${destFileName}`,
                    tags: ['fertilizer', 'premium', 'high-yield']
                });
                await p.save();
                console.log(`✅ Created product: ${p.name}`);
            } else {
                console.log(`ℹ️ Product already exists: ${exists.name}`);
            }
        }
        console.log('🎉 Done adding user products!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seed();
