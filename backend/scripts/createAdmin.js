const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('../models/User');

async function createAdmin() {
  const args = process.argv.slice(2);
  const email = args[0] || 'admin@darshanease.com';
  const password = args[1] || 'admin123';
  const name = args[2] || 'System Admin';
  const phone = args[3] || '9999999999';

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/darshanease';
    console.log('[CREATE_ADMIN] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      user.role = 'ADMIN';
      if (password) user.password = password;
      user.name = name || user.name;
      user.isEmailVerified = true;
      user.isActive = true;
      await user.save();
      console.log(`[CREATE_ADMIN] Promoted existing user "${email}" to ADMIN successfully.`);
    } else {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: 'ADMIN',
        phone,
        isEmailVerified: true,
        isActive: true
      });
      console.log(`[CREATE_ADMIN] Created new ADMIN user successfully:\n  Email: ${user.email}\n  Password: ${password}`);
    }
  } catch (error) {
    console.error('[CREATE_ADMIN] Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
