const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

dns.setServers(['8.8.8.8', '8.8.4.4']);

const Temple = require('../models/Temple');
const User = require('../models/User');
const allTemplesData = require('../data/templesData');

async function updateTempleImages() {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/darshanease';
    await mongoose.connect(dbUri);
    console.log('[UPDATE_IMAGES] Connected to MongoDB.');


    const defaultOrganizer = await User.findOne({ role: 'ORGANIZER' });

    let updatedCount = 0;
    let insertedCount = 0;

    for (let i = 0; i < allTemplesData.length; i++) {
      const tData = allTemplesData[i];

      const existing = await Temple.findOne({ name: tData.name });

      if (existing) {
        existing.imageUrl = tData.imageUrl;
        if (!existing.openingHours && tData.openingHours) existing.openingHours = tData.openingHours;
        if (!existing.speciality && tData.speciality) existing.speciality = tData.speciality;
        await existing.save();
        updatedCount++;
      } else {
        await Temple.create({
          ...tData,
          createdBy: defaultOrganizer ? defaultOrganizer._id : null
        });
        insertedCount++;
      }
    }

    const totalInDb = await Temple.countDocuments();

    console.log(`[UPDATE_IMAGES] Done! Processed ${allTemplesData.length} temples.`);
    console.log(`[UPDATE_IMAGES] Updated: ${updatedCount}, Inserted: ${insertedCount}. Total in DB: ${totalInDb}`);

  } catch (err) {
    console.error('[UPDATE_IMAGES] Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateTempleImages();
