const Booking = require('../models/Booking');
const DarshanSlot = require('../models/DarshanSlot');
const Temple = require('../models/Temple');
const { sendEmail } = require('../utils/emailHelper');

// Helper: Generate Unique Booking Reference
const generateBookingReference = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = 'DSE-';
  for (let i = 0; i < 8; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (USER)
const createBooking = async (req, res) => {
  try {
    const { slotId, devotees, paymentMethod, upiId } = req.body;

    if (!devotees || devotees.length === 0) {
      return res.status(400).json({ success: false, message: 'Please add at least one pilgrim/devotee' });
    }

    // Validate UPI payment fields
    if (paymentMethod === 'UPI') {
      if (!upiId) {
        return res.status(400).json({ success: false, message: 'UPI ID is required for UPI payments' });
      }
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!upiRegex.test(upiId)) {
        return res.status(400).json({ success: false, message: 'Invalid UPI ID format' });
      }

      // Validate UPI Transaction Reference (UTR) Number
      const { transactionId } = req.body;
      if (!transactionId) {
        return res.status(400).json({ success: false, message: 'UPI Transaction Reference (UTR) Number is required' });
      }
      const utrRegex = /^\d{12}$/;
      if (!utrRegex.test(transactionId)) {
        return res.status(400).json({ success: false, message: 'Invalid UTR Number. Must be exactly 12 digits' });
      }
    }

    // Fetch slot
    const slot = await DarshanSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Darshan slot not found' });
    }

    // Check availability
    const availableTickets = slot.maxCapacity - slot.bookedCount;
    if (availableTickets < devotees.length) {
      return res.status(400).json({
        success: false,
        message: `Insufficient slots. Only ${availableTickets} slots are available for this time.`
      });
    }

    const totalPrice = slot.price * devotees.length;
    const bookingReference = generateBookingReference();

    // Set transaction ID (use user UTR for UPI, or generate mock code for Card)
    let finalTransactionId;
    if (paymentMethod === 'UPI') {
      finalTransactionId = req.body.transactionId;
    } else {
      finalTransactionId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      temple: slot.temple,
      slot: slotId,
      devotees,
      totalPrice,
      bookingReference,
      paymentMethod: paymentMethod || 'Card',
      upiId: paymentMethod === 'UPI' ? upiId : undefined,
      transactionId: finalTransactionId
    });

    // Update slot booked count
    slot.bookedCount += devotees.length;
    await slot.save();

    // Populate temple and slot for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('temple')
      .populate('slot');

    // Send Receipt Email
    try {
      const email = req.user.email;
      const userName = req.user.name;
      const templeName = populatedBooking.temple.name;
      const slotDate = populatedBooking.slot.date;
      const slotTime = populatedBooking.slot.timeSlot;
      const slotType = populatedBooking.slot.slotType;
      const formattedTimestamp = new Date().toLocaleString();

      const devoteesHtml = devotees
        .map((dev, i) => `<li>#${i + 1}: ${dev.name} (Age: ${dev.age}, Gender: ${dev.gender}, ID: ${dev.idProofType} - ${dev.idProofNumber})</li>`)
        .join('');

      const isConfirmed = populatedBooking.status === 'Confirmed';
      const subject = isConfirmed 
        ? `DarshanEase Payment Receipt - ${bookingReference}`
        : `DarshanEase Reservation Received (Verification Pending) - ${bookingReference}`;
      
      const text = isConfirmed
        ? `Dear ${userName},

Thank you for booking with DarshanEase. Your booking has been confirmed!

--- TRANSACTION DETAILS ---
Booking Reference: ${bookingReference}
Transaction ID: ${finalTransactionId}
Date/Time of Transaction: ${formattedTimestamp}
Payment Method: ${paymentMethod || 'Card'}
${paymentMethod === 'UPI' ? `UPI ID Used: ${upiId}\n` : ''}Total Paid: ₹${totalPrice}

--- DARSHAN DETAILS ---
Temple: ${templeName}
Date: ${slotDate}
Time Slot: ${slotTime} (${slotType} Darshan)
Pilgrims Count: ${devotees.length}

Please find your details inside the application under the "My Bookings" tab.

Have a blessed Darshan,
DarshanEase Support`
        : `Dear ${userName},

We have received your reservation request. Your payment verification is currently pending.

--- TRANSACTION DETAILS ---
Booking Reference: ${bookingReference}
Transaction ID (UTR): ${finalTransactionId} (Submitted for Verification)
Date/Time: ${formattedTimestamp}
Payment Method: ${paymentMethod || 'Card'}
${paymentMethod === 'UPI' ? `UPI ID Used: ${upiId}\n` : ''}Total Amount: ₹${totalPrice}

--- DARSHAN DETAILS ---
Temple: ${templeName}
Date: ${slotDate}
Time Slot: ${slotTime} (${slotType} Darshan)
Pilgrims Count: ${devotees.length}

Once our administration verifies your UPI transfer, we will confirm your booking and send you another email.

Regards,
DarshanEase Support`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #d97706; text-align: center; border-bottom: 2px solid #fef3c7; padding-bottom: 12px; margin-bottom: 20px;">
            ${isConfirmed ? 'Darshan Ticket Receipt' : 'Reservation Received (Verification Pending)'}
          </h2>
          
          <p>Dear <strong>${userName}</strong>,</p>
          <p>${isConfirmed ? 'Your reservation is confirmed. Here are your transaction details:' : 'We have received your payment submission. Your reservation is pending verification. Here are the details:'}</p>
          
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">Payment Information</h4>
            <table style="width: 100%; font-size: 0.9rem; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Booking Reference:</strong></td>
                <td style="padding: 4px 0; text-align: right; color: #1e293b;">${bookingReference}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Transaction ID (UTR):</strong></td>
                <td style="padding: 4px 0; text-align: right; color: #1e293b;"><code>${finalTransactionId}</code></td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Date / Time:</strong></td>
                <td style="padding: 4px 0; text-align: right; color: #1e293b;">${formattedTimestamp}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Payment Method:</strong></td>
                <td style="padding: 4px 0; text-align: right; color: #1e293b;">${paymentMethod || 'Card'}</td>
              </tr>
              ${paymentMethod === 'UPI' ? `
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>UPI ID Used:</strong></td>
                <td style="padding: 4px 0; text-align: right; color: #1e293b;"><code>${upiId}</code></td>
              </tr>` : ''}
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Status:</strong></td>
                <td style="padding: 4px 0; text-align: right; font-weight: bold; color: ${isConfirmed ? '#16a34a' : '#d97706'};">${isConfirmed ? 'Confirmed' : 'Pending Verification'}</td>
              </tr>
              <tr style="border-top: 1px dashed #cbd5e1;">
                <td style="padding: 8px 0 0 0; color: #1e293b; font-size: 1rem;"><strong>Total Paid:</strong></td>
                <td style="padding: 8px 0 0 0; text-align: right; color: #d97706; font-size: 1.1rem; font-weight: 700;">₹${totalPrice}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #fdfaf7; padding: 16px; border-radius: 6px; border: 1px solid #fef3c7; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #1e293b; border-bottom: 1px solid #fef3c7; padding-bottom: 6px;">Darshan Details</h4>
            <p style="margin: 4px 0; font-size: 0.9rem;"><strong>Temple:</strong> ${templeName}</p>
            <p style="margin: 4px 0; font-size: 0.9rem;"><strong>Date:</strong> ${slotDate}</p>
            <p style="margin: 4px 0; font-size: 0.9rem;"><strong>Time Slot:</strong> ${slotTime} (${slotType} Darshan)</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Pilgrims List</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 0.85rem; color: #475569; line-height: 1.6;">
              ${devoteesHtml}
            </ul>
          </div>

          <p style="font-size: 0.85rem; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            ${isConfirmed ? 'Have a blessed spiritual journey. Thank you for using DarshanEase!' : 'Once verified, we will confirm your booking and send your printable ticket pass. Thank you for your patience!'}
          </p>
        </div>
      `;

      await sendEmail({ to: email, subject, text, html });
    } catch (mailError) {
      console.error('Error sending confirmation email receipt:', mailError.message);
    }

    res.status(201).json({ success: true, data: populatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (USER, ORGANIZER, ADMIN)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('temple')
      .populate('slot')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (ADMIN)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('temple')
      .populate('slot')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get bookings for a specific temple
// @route   GET /api/bookings/temple/:templeId
// @access  Private (ADMIN, ORGANIZER)
const getTempleBookings = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.templeId);
    if (!temple) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }

    // Role check: Organizer can only view bookings for their own temple
    if (req.user.role !== 'ADMIN' && temple.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view bookings for this temple'
      });
    }

    const bookings = await Booking.find({ temple: req.params.templeId })
      .populate('user', 'name email phone')
      .populate('slot')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (USER, ADMIN)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization: User who booked it or Admin can cancel
    if (req.user.role !== 'ADMIN' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Update booking status
    booking.status = 'Cancelled';
    await booking.save();

    // Revert slot booked count
    const slot = await DarshanSlot.findById(booking.slot);
    if (slot) {
      slot.bookedCount = Math.max(0, slot.bookedCount - booking.devotees.length);
      await slot.save();
    }

    res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify a booking payment (Approve)
// @route   PUT /api/bookings/:id/verify
// @access  Private (ADMIN, ORGANIZER)
const verifyBookingPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('temple')
      .populate('slot');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Role check: Organizer can only verify bookings for their own temple
    if (req.user.role !== 'ADMIN' && booking.temple.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify bookings for this temple'
      });
    }

    if (booking.status === 'Confirmed') {
      return res.status(400).json({ success: false, message: 'Booking is already confirmed' });
    }

    booking.status = 'Confirmed';
    await booking.save();

    // Send Confirmation Email
    try {
      const email = booking.user.email;
      const userName = booking.user.name;
      const templeName = booking.temple.name;
      const slotDate = booking.slot.date;
      const slotTime = booking.slot.timeSlot;
      const slotType = booking.slot.slotType;
      const devoteesHtml = booking.devotees
        .map((dev, i) => `<li>#${i + 1}: ${dev.name} (Age: ${dev.age}, Gender: ${dev.gender}, ID: ${dev.idProofType} - ${dev.idProofNumber})</li>`)
        .join('');

      const subject = `DarshanEase Payment Confirmed - Ticket Receipt: ${booking.bookingReference}`;
      const text = `Dear ${userName},

Your payment of ₹${booking.totalPrice} has been successfully verified! Your booking reference is ${booking.bookingReference}.

--- DARSHAN RESERVATION DETAILS ---
Temple: ${templeName}
Date: ${slotDate}
Time Slot: ${slotTime} (${slotType} Darshan)
Pilgrims Count: ${booking.devotees.length}

You can print your physical pass by logging into your dashboard and navigating to the "My Bookings" page.

Have a blessed Darshan,
DarshanEase Support`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #059669; text-align: center; border-bottom: 2px solid #a7f3d0; padding-bottom: 12px; margin-bottom: 20px;">Payment Verified & Booking Confirmed</h2>
          
          <p>Dear <strong>${userName}</strong>,</p>
          <p>We are pleased to inform you that your UPI payment of <strong>₹${booking.totalPrice}</strong> has been successfully verified. Your tickets are now confirmed!</p>
          
          <div style="background-color: #f0fdf4; padding: 16px; border-radius: 6px; border: 1px solid #dcfce7; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #14532d; border-bottom: 1px solid #bbf7d0; padding-bottom: 6px;">Reservation Summary</h4>
            <p style="margin: 4px 0; font-size: 0.9rem;"><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
            <p style="margin: 4px 0; font-size: 0.9rem;"><strong>Transaction UTR Ref:</strong> <code>${booking.transactionId}</code></p>
            <p style="margin: 4px 0; font-size: 0.9rem;"><strong>Temple:</strong> ${templeName}</p>
            <p style="margin: 4px 0; font-size: 0.9rem;"><strong>Date:</strong> ${booking.slot.date}</p>
            <p style="margin: 4px 0; font-size: 0.9rem;"><strong>Time Slot:</strong> ${booking.slot.timeSlot} (${booking.slot.slotType} Darshan)</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Pilgrims Manifest</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 0.85rem; color: #475569; line-height: 1.6;">
              ${devoteesHtml}
            </ul>
          </div>

          <p style="font-size: 0.85rem; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            Please log in to your account to download or print your physical ticket. Have a safe and blessed darshan!
          </p>
        </div>
      `;

      await sendEmail({ to: email, subject, text, html });
    } catch (mailError) {
      console.error('Error sending verified email receipt:', mailError.message);
    }

    res.json({ success: true, message: 'Booking payment verified successfully', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a booking payment (Decline/Cancel)
// @route   PUT /api/bookings/:id/reject
// @access  Private (ADMIN, ORGANIZER)
const rejectBookingPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('temple')
      .populate('slot');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Role check: Organizer can only reject bookings for their own temple
    if (req.user.role !== 'ADMIN' && booking.temple.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject bookings for this temple'
      });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    // Revert slot booked count
    const slot = await DarshanSlot.findById(booking.slot._id);
    if (slot) {
      slot.bookedCount = Math.max(0, slot.bookedCount - booking.devotees.length);
      await slot.save();
    }

    // Send Rejection Email
    try {
      const email = booking.user.email;
      const userName = booking.user.name;
      const templeName = booking.temple.name;
      const subject = `DarshanEase Payment Verification Failed - Reference: ${booking.bookingReference}`;
      
      const text = `Dear ${userName},

We were unable to verify your payment of ₹${booking.totalPrice} for booking ${booking.bookingReference}.

As a result, your booking has been cancelled and the slot has been released. 
If the amount was deducted from your account, please contact our support team at ${process.env.EMAIL_USER} with your bank reference statement showing the UTR Number: ${booking.transactionId}.

Regards,
DarshanEase Support`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #dc2626; text-align: center; border-bottom: 2px solid #fee2e2; padding-bottom: 12px; margin-bottom: 20px;">Payment Verification Failed</h2>
          
          <p>Dear <strong>${userName}</strong>,</p>
          <p>We are writing to inform you that we could not verify the UPI payment for booking reference: <strong>${booking.bookingReference}</strong> with the UTR Reference number you provided (<code>${booking.transactionId}</code>).</p>
          
          <div style="background-color: #fef2f2; padding: 16px; border-radius: 6px; border: 1px solid #fee2e2; margin-bottom: 20px; color: #7f1d1d;">
            <p style="margin: 4px 0; font-size: 0.9rem;"><strong>Status:</strong> Cancelled (Payment Unverified)</p>
            <p style="margin: 4px 0; font-size: 0.9rem;"><strong>Temple:</strong> ${templeName}</p>
            <p style="margin: 4px 0; font-size: 0.9rem;"><strong>Amount:</strong> ₹${booking.totalPrice}</p>
            <p style="margin: 4px 0; font-size: 0.9rem;"><strong>Provided UTR Ref:</strong> <code>${booking.transactionId}</code></p>
          </div>

          <p style="font-size: 0.9rem; color: #475569;">
            If money was deducted from your account, please write to us at <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a> with your bank statement showing the transaction detail.
          </p>

          <p style="font-size: 0.85rem; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            Thank you for your understanding.
          </p>
        </div>
      `;

      await sendEmail({ to: email, subject, text, html });
    } catch (mailError) {
      console.error('Error sending verification rejection email:', mailError.message);
    }

    res.json({ success: true, message: 'Booking payment verification failed, booking cancelled', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getTempleBookings,
  cancelBooking,
  verifyBookingPayment,
  rejectBookingPayment
};
