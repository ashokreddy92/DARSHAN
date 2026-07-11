const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/darshanease';
    const isAtlas = dbUri.includes('mongodb+srv://') || dbUri.includes('.mongodb.net');
    console.log(`Attempting to connect to ${isAtlas ? 'MongoDB Atlas' : 'Local Database'}...`);
    
    // Disable query buffering so we fail fast if disconnected
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 5000 // Time out after 5 seconds instead of 30
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    console.error("Troubleshooting Tip: Ensure your public IP address is whitelisted in MongoDB Atlas Network Access!");
    process.exit(1);
  }
};

module.exports = connectDB;
