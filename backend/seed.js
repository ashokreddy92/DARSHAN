const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const path = require('path');

// Force Node.js DNS resolution to use Google's Public DNS.
dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('./models/User');
const Temple = require('./models/Temple');
const DarshanSlot = require('./models/DarshanSlot');
const Booking = require('./models/Booking');
const Donation = require('./models/Donation');
const allTemplesData = require('./data/templesData');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/darshanease');
    console.log('MongoDB Connected for Seeding...');

    // Clear existing database collections
    await User.deleteMany();
    await Temple.deleteMany();
    await DarshanSlot.deleteMany();
    await Booking.deleteMany();
    await Donation.deleteMany();
    console.log('Cleared existing collections.');

    // 1. Create Default Core Users
    const admin = await User.create({
      name: 'DarshanEase Admin',
      email: 'admin@darshanease.com',
      password: 'admin123',
      role: 'ADMIN',
      phone: '9999999999'
    });

    const generalOrganizer = await User.create({
      name: 'General Temple Organizer',
      email: 'organizer@darshanease.com',
      password: 'organizer123',
      role: 'ORGANIZER',
      phone: '8888888888'
    });

    const normalUser = await User.create({
      name: 'Ramesh Kumar',
      email: 'ramesh@gmail.com',
      password: 'user123',
      role: 'USER',
      phone: '7777777777'
    });

    console.log('Created Users: Global Admin, General Organizer, and Normal User.');

    // 2. Create Temples and their Organizers
    console.log(`Seeding ${allTemplesData.length} Sacred Temples...`);
    const createdTemples = [];

    for (let i = 0; i < allTemplesData.length; i++) {
      const tData = allTemplesData[i];

      // Safe clean email prefix
      const safePrefix = tData.name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .substring(0, 25);

      const organizerEmail = `${safePrefix}_${i + 1}@darshanease.com`;
      const organizerName = `${tData.name} Organizer`;

      const siteOrganizer = await User.create({
        name: organizerName,
        email: organizerEmail,
        password: 'organizer123',
        role: 'ORGANIZER',
        phone: `910000${String(i + 1).padStart(4, '0')}`
      });

      const newTemple = await Temple.create({
        ...tData,
        createdBy: siteOrganizer._id
      });

      createdTemples.push(newTemple);
    }

    console.log(`Successfully created ${createdTemples.length} Temples & their Organizers.`);

    // 3. Bulk Insert Darshan Slots for Next 7 Days
    console.log('Generating Darshan Slots for all temples across 7 days...');
    const timeSlots = [
      '06:00 AM - 08:00 AM',
      '09:00 AM - 11:00 AM',
      '02:00 PM - 04:00 PM',
      '06:00 PM - 08:00 PM'
    ];

    const slotTypes = [
      { type: 'VIP', price: 300, capacity: 30 },
      { type: 'Special Pooja', price: 500, capacity: 15 }
    ];

    const slotsToInsert = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];

      for (const temple of createdTemples) {
        for (const slotTypeData of slotTypes) {
          for (const timeSlot of timeSlots) {
            slotsToInsert.push({
              temple: temple._id,
              date: dateString,
              timeSlot,
              maxCapacity: slotTypeData.capacity,
              bookedCount: 0,
              price: slotTypeData.price,
              slotType: slotTypeData.type
            });
          }
        }
      }
    }

    // Insert all in batches of 1,000 for ultra-fast performance
    const BATCH_SIZE = 1000;
    for (let b = 0; b < slotsToInsert.length; b += BATCH_SIZE) {
      const batch = slotsToInsert.slice(b, b + BATCH_SIZE);
      await DarshanSlot.insertMany(batch);
    }
    console.log(`Created ${slotsToInsert.length} slots across 7 days.`);

    // 4. Create a sample mock Booking
    const sampleSlot = await DarshanSlot.findOne({
      temple: createdTemples[0]._id,
      slotType: 'VIP'
    });

    if (sampleSlot) {
      const booking = await Booking.create({
        user: normalUser._id,
        temple: createdTemples[0]._id,
        slot: sampleSlot._id,
        devotees: [
          {
            name: 'Ramesh Kumar',
            age: 35,
            gender: 'Male',
            idProofType: 'Aadhaar',
            idProofNumber: '1234-5678-9012'
          }
        ],
        totalPrice: sampleSlot.price,
        bookingReference: 'DSE-TIRU001'
      });

      sampleSlot.bookedCount += 1;
      await sampleSlot.save();
      console.log('Created sample booking for Sri Venkateswara Temple.');
    }

    // 5. Create a mock Donation
    await Donation.create({
      user: normalUser._id,
      temple: createdTemples[0]._id,
      donorName: 'Ramesh Kumar',
      amount: 5000,
      purpose: 'Annadanam (Free Food Distribution)',
      transactionId: 'TXN-ANNA5000'
    });
    console.log('Created sample donation.');

    console.log('Database Seeding Completed Successfully with all 100 temples!');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();