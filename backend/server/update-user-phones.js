const mongoose = require('mongoose');
const User = require('./models/User.js');

async function updateUsersWithPhone() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pavithratraders');
    console.log('Connected to MongoDB');
    
    // Find users without phone numbers
    const usersWithoutPhone = await User.find({ phone: { $exists: false } });
    console.log(`Found ${usersWithoutPhone.length} users without phone numbers`);
    
    // Update admin user with default phone
    const admin = await User.findOne({ username: 'admin' });
    if (admin && !admin.phone) {
      admin.phone = '7904212501'; // Use your business phone number
      await admin.save();
      console.log('✅ Updated admin user with phone:', admin.phone);
    }
    
    // List other users that need phone numbers
    const otherUsers = await User.find({ 
      username: { $ne: 'admin' },
      $or: [
        { phone: { $exists: false } },
        { phone: null },
        { phone: '' }
      ]
    });
    
    if (otherUsers.length > 0) {
      console.log('\n⚠️  The following users need phone numbers:');
      otherUsers.forEach(user => {
        console.log(`   - Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
      });
      console.log('\n💡 These users will need to create new accounts or contact support to add phone numbers.');
    }
    
    console.log('\n✅ Update complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating users:', error);
    process.exit(1);
  }
}

updateUsersWithPhone();
