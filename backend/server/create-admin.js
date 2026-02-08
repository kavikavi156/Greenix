const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Admin = require('./models/Admin.js'); // Use Admin model
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pavithratraders');
    console.log('Connected to MongoDB');

    const email = 'wrkkavi@gmail.com';
    const password = 'kavi@2023';
    const name = 'Default Admin';
    const phone = '7904212501';

    // Check if admin exists
    let admin = await Admin.findOne({ email });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (admin) {
      console.log('Admin already exists. Updating password...');
      admin.password = hashedPassword;
      admin.name = name; // Ensure name is consistent
      admin.phone = phone; // Ensure phone is consistent
      await admin.save();
      console.log('✅ Admin password updated successfully!');
    } else {
      console.log('Creating new admin...');
      admin = new Admin({
        name,
        email,
        password: hashedPassword,
        phone,
        role: 'admin'
      });
      await admin.save();
      console.log('✅ New Admin created successfully!');
    }

    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating/updating admin:', error);
    process.exit(1);
  }
}

createAdmin();