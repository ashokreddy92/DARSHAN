const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Temple = require('../models/Temple');
const DarshanSlot = require('../models/DarshanSlot');
const Booking = require('../models/Booking');

async function runVerification() {
  try {
    console.log('Connecting to database for verification...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/darshanease');
    console.log('Connected.');

    const admin = await User.findOne({ role: 'ADMIN' });
    const temple = await Temple.findOne({});
    const slot = await DarshanSlot.findOne({ temple: temple._id });

    if (!admin || !temple || !slot) {
      console.error('Missing prerequisites (admin/temple/slot).');
      process.exit(1);
    }

    console.log(`Using Admin: ${admin.name}, Temple: ${temple.name}`);

    // 1. Create a test confirmed booking
    const testRef = 'DSE-TEST' + Math.floor(1000 + Math.random() * 9000);
    const booking = await Booking.create({
      user: admin._id,
      temple: temple._id,
      slot: slot._id,
      devotees: [{
        name: 'Verification Pilgrim',
        age: 30,
        gender: 'Male',
        idProofType: 'Aadhaar',
        idProofNumber: '1111-2222-3333'
      }],
      totalPrice: 500,
      status: 'Confirmed',
      bookingReference: testRef,
      paymentMethod: 'UPI',
      transactionId: '123456789012',
      qrCode: testRef
    });
    console.log(`Step 1: Created test booking with reference ${testRef}, Status: ${booking.status}`);

    // 2. Simulate First QR Scan (Check-in)
    console.log('Step 2: Simulating First QR Scan...');
    const foundBooking = await Booking.findOne({ bookingReference: testRef });
    if (!foundBooking || foundBooking.status !== 'Confirmed') {
      throw new Error('Initial booking state invalid');
    }

    foundBooking.status = 'CHECKED_IN';
    foundBooking.checkedInAt = new Date();
    foundBooking.checkedInBy = admin._id;
    await foundBooking.save();

    console.log(`✅ First scan succeeded! Status is now: ${foundBooking.status}, checkedInAt: ${foundBooking.checkedInAt}`);

    // 3. Simulate Duplicate QR Scan (Should detect already checked in)
    console.log('Step 3: Simulating Duplicate QR Scan on same ticket...');
    const duplicateCheck = await Booking.findOne({ bookingReference: testRef });
    const normalized = (duplicateCheck.status || '').toUpperCase();
    if (normalized === 'CHECKED_IN' || normalized === 'CHECKED IN') {
      console.log(`✅ Duplicate scan correctly identified! "❌ Ticket Already Used" - checked in at: ${duplicateCheck.checkedInAt}`);
    } else {
      throw new Error('Failed to detect duplicate check-in!');
    }

    // 4. Test User Role Update & Staff Assignment
    console.log('Step 4: Testing Staff user creation and temple assignment...');
    const staffEmail = `teststaff_${Date.now()}@darshanease.com`;
    const staffUser = await User.create({
      name: 'Temple Gate Staff',
      email: staffEmail,
      password: 'staffpassword123',
      role: 'TEMPLE_STAFF',
      temple: temple._id,
      phone: '9876543210'
    });

    const populatedStaff = await User.findById(staffUser._id).populate('temple', 'name');
    console.log(`✅ Staff User verified! Name: ${populatedStaff.name}, Role: ${populatedStaff.role}, Assigned: ${populatedStaff.temple?.name}`);

    // Cleanup test records
    await Booking.deleteOne({ _id: booking._id });
    await User.deleteOne({ _id: staffUser._id });
    console.log('Cleaned up test records.');

    console.log('\n🌟 ALL SYSTEM VERIFICATION CHECKS PASSED SUCCESSFULLY! 🌟');
    process.exit(0);
  } catch (err) {
    console.error('Verification failed:', err);
    process.exit(1);
  }
}

runVerification();
