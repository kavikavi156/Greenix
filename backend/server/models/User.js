const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String }, // Not required for Google OAuth users
  phone: { type: String }, // Optional for backward compatibility with existing users
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  googleId: { type: String, unique: true, sparse: true }, // Google OAuth ID
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' }, // Auth method
  profilePicture: { type: String }, // For Google profile picture
  cart: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 }
  }],
  wishlist: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    addedAt: { type: Date, default: Date.now }
  }],
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    phone: String
  },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
