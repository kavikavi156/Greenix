require('dotenv').config();
const mongoose = require('mongoose');

async function fixReviewIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pavithratraders');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('reviews');

    console.log('\nCurrent indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log('Index:', JSON.stringify(index));
    });

    console.log('\nDropping old indexes...');
    
    // Try to drop the problematic index
    try {
      await collection.dropIndex('user_1_product_1');
      console.log('✓ Dropped old index: user_1_product_1');
    } catch (err) {
      console.log('Index user_1_product_1 not found or already dropped');
    }

    // Drop all indexes except _id
    try {
      await collection.dropIndexes();
      console.log('✓ Dropped all indexes');
    } catch (err) {
      console.log('Error dropping indexes:', err.message);
    }

    console.log('\nRecreating correct indexes...');
    
    // Create the correct index
    await collection.createIndex(
      { productId: 1, userId: 1 }, 
      { unique: true, name: 'productId_1_userId_1' }
    );
    console.log('✓ Created index: productId_1_userId_1');

    await collection.createIndex(
      { createdAt: -1 }, 
      { name: 'createdAt_-1' }
    );
    console.log('✓ Created index: createdAt_-1');

    await collection.createIndex(
      { productId: 1 }, 
      { name: 'productId_1' }
    );
    console.log('✓ Created index: productId_1');

    console.log('\n✅ All indexes fixed successfully!');
    
    console.log('\nFinal indexes:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach(index => {
      console.log('Index:', JSON.stringify(index));
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
}

fixReviewIndexes();
