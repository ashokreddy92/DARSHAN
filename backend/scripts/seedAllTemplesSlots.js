const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Temple = require('../models/Temple');
const DarshanSlot = require('../models/DarshanSlot');

async function seedAllSlots() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/darshanease';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    const temples = await Temple.find({});
    console.log(`Found ${temples.length} temples in the database.`);

    if (temples.length === 0) {
      console.log('No temples found to add slots for.');
      process.exit(0);
    }

    const timeSlots = [
      '06:00 AM - 08:00 AM',
      '09:00 AM - 11:00 AM',
      '03:00 PM - 05:00 PM',
      '06:00 PM - 08:00 PM'
    ];

    const slotTypes = [
      { type: 'General', price: 0, capacity: 100 },
      { type: 'VIP', price: 500, capacity: 30 },
      { type: 'Special Pooja', price: 1000, capacity: 15 }
    ];

    const days = 30; // 30 days of upcoming slots
    const today = new Date();
    const bulkOps = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;

      for (const temple of temples) {
        for (const slotTypeData of slotTypes) {
          for (const timeSlot of timeSlots) {
            bulkOps.push({
              updateOne: {
                filter: {
                  temple: temple._id,
                  date: dateString,
                  timeSlot: timeSlot,
                  slotType: slotTypeData.type
                },
                update: {
                  $setOnInsert: {
                    temple: temple._id,
                    date: dateString,
                    timeSlot: timeSlot,
                    maxCapacity: slotTypeData.capacity,
                    bookedCount: 0,
                    price: slotTypeData.price,
                    slotType: slotTypeData.type
                  }
                },
                upsert: true
              }
            });
          }
        }
      }
    }

    console.log(`Prepared ${bulkOps.length} slot operations for ${temples.length} temples across ${days} days...`);
    
    // Execute in chunks to avoid single massive payload if needed
    const CHUNK_SIZE = 1000;
    let totalUpserted = 0;
    let totalMatched = 0;

    for (let i = 0; i < bulkOps.length; i += CHUNK_SIZE) {
      const chunk = bulkOps.slice(i, i + CHUNK_SIZE);
      const res = await DarshanSlot.bulkWrite(chunk, { ordered: false });
      totalUpserted += (res.upsertedCount || 0);
      totalMatched += (res.matchedCount || 0);
      console.log(`Processed chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(bulkOps.length / CHUNK_SIZE)}: ${res.upsertedCount || 0} inserted, ${res.matchedCount || 0} existing.`);
    }

    console.log(`\nDONE! Summary:`);
    console.log(`- Temples: ${temples.length}`);
    console.log(`- Days generated: ${days} days (from ${new Date().toISOString().split('T')[0]})`);
    console.log(`- New slots added: ${totalUpserted}`);
    console.log(`- Already existing slots preserved: ${totalMatched}`);

    const currentTotalSlots = await DarshanSlot.countDocuments({});
    console.log(`- Total slots in database now: ${currentTotalSlots}`);

    process.exit(0);
  } catch (err) {
    console.error('Error generating slots:', err);
    process.exit(1);
  }
}

seedAllSlots();
