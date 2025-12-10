const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User.js');

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pavithratraders');
    console.log('Connected to MongoDB');
    
    // Remove existing admin if any
    await User.deleteOne({ username: 'kavinesh' });
    await User.deleteOne({ email: 'wrkkavi@gmail.com' });
    await User.deleteOne({ username: 'admin' });
    
    // Create new admin
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const admin = new User({
      name: 'kavinesh',
      email: 'wrkkavi@gmail.com',
      username: 'kavinesh',
      password: hashedPassword,
      phone: '7904212501',
      role: 'admin'
    });
    
    await admin.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: wrkkavi@gmail.com');
    console.log('👤 Username: kavinesh');
    console.log('🔑 Password: Admin@123');
    console.log('🔒 Role: admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();