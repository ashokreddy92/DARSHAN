const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const PaymentAuditLog = require('../models/PaymentAuditLog');

async function syncPayments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const bookings = await Booking.find();
    console.log(`Found ${bookings.length} existing bookings to inspect.`);

    let createdCount = 0;
    for (const b of bookings) {
      const existingPayment = await Payment.findOne({
        $or: [
          { booking: b._id },
          { transactionReference: b.transactionId }
        ]
      });

      if (!existingPayment) {
        const paymentId = `PAY-HIST-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        const isConfirmed = ['Confirmed', 'CONFIRMED', 'Checked In', 'CHECKED_IN'].includes(b.status);
        const status = isConfirmed ? 'Successful' : (b.status === 'Cancelled' ? 'Cancelled' : 'Pending');

        const payment = await Payment.create({
          paymentId,
          booking: b._id,
          user: b.user,
          temple: b.temple,
          amount: b.totalPrice || 250,
          currency: 'INR',
          paymentMethod: b.paymentMethod || 'Card',
          gateway: 'MockGateway',
          transactionReference: b.transactionId || `TXN-${b.bookingReference}`,
          status,
          createdAt: b.createdAt || new Date(),
          timeline: [
            { milestone: 'PAYMENT_CREATED', timestamp: b.createdAt || new Date(), note: 'Transaction created' },
            { milestone: status === 'Successful' ? 'PAYMENT_VERIFIED' : 'PAYMENT_RECORDED', timestamp: b.createdAt || new Date(), note: `Status: ${status}` }
          ]
        });

        await PaymentAuditLog.create({
          paymentId,
          bookingId: b._id,
          eventType: status === 'Successful' ? 'PAYMENT_SUCCESS' : 'PAYMENT_CREATED',
          previousStatus: 'None',
          newStatus: status,
          actorType: 'SYSTEM',
          message: `Backfilled initial payment record for booking ${b.bookingReference}`,
          createdAt: b.createdAt || new Date()
        });

        createdCount++;
      }
    }

    console.log(`Synchronized ${createdCount} payment logbook records.`);
    process.exit(0);
  } catch (err) {
    console.error('Error syncing payments:', err);
    process.exit(1);
  }
}

syncPayments();
