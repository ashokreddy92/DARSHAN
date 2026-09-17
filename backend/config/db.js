const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js DNS resolution to use Google's Public DNS.
// This resolves the querySrv ECONNREFUSED error caused by some local ISP/network DNS configurations.
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/darshanease';
    const isAtlas = dbUri.includes('mongodb+srv://') || dbUri.includes('.mongodb.net');
    console.log(`Attempting to connect to ${isAtlas ? 'MongoDB Atlas' : 'Local Database'}...`);

    // Disable query buffering so we fail fast if disconnected
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 5000, // Time out after 5 seconds instead of 30
      maxPoolSize: 15,                // Prevent exceeding MongoDB Atlas connection caps across multi-instances
      minPoolSize: 2,                 // Maintain warm connections ready for instant queries
      socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DatabaseConnection Error: ${error.message}`);
    console.error("Troubleshooting Tip: Ensure your public IP address is whitelisted in MongoDB Atlas Network Access!");
    process.exit(1);
  }
};

module.exports = connectDB;
