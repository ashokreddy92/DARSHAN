const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

dns.setServers(['8.8.8.8', '8.8.4.4']);

const DarshanSlot = require('../models/DarshanSlot');
const redisClient = require('../config/redis');

async function purgeUnbookedGeneralSlots() {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/darshanease';
    console.log('[MIGRATION] Connecting to MongoDB...');
    await mongoose.connect(dbUri);
    console.log('[MIGRATION] Connected to MongoDB.');

    // Count total General slots
    const totalGeneral = await DarshanSlot.countDocuments({ slotType: 'General' });
    console.log(`[MIGRATION] Total General slots currently in DB: ${totalGeneral}`);

    // Delete only unbooked General slots (bookedCount === 0)
    const deleteResult = await DarshanSlot.deleteMany({
      slotType: 'General',
      bookedCount: { $lte: 0 }
    });
    console.log(`[MIGRATION] Purged ${deleteResult.deletedCount} unbooked General slots.`);

    // If any booked General slots exist, close them so no more tickets can be issued
    const closeResult = await DarshanSlot.updateMany(
      { slotType: 'General', bookedCount: { $gt: 0 } },
      { $set: { status: 'Closed' } }
    );
    console.log(`[MIGRATION] Closed ${closeResult.modifiedCount} booked General slots for historical preservation.`);

    // Invalidate Redis slot cache
    try {
      if (redisClient && (redisClient.isOpen || redisClient.isReady)) {
        const keys = await redisClient.keys('*slot*');
        if (keys.length > 0) {
          await redisClient.del(keys);
          console.log(`[MIGRATION] Invalidated ${keys.length} slot keys in Redis.`);
        }
      }
    } catch (redisErr) {
      console.warn('[MIGRATION] Redis cache clearing skipped/failed:', redisErr.message);
    }

    console.log('[MIGRATION] Completed successfully.');
  } catch (err) {
    console.error('[MIGRATION] Error:', err);
  } finally {
    await mongoose.disconnect();
    try {
      if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
      }
    } catch (_) {}
    process.exit(0);
  }
}

purgeUnbookedGeneralSlots();
