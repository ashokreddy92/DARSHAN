const Donation = require('../models/Donation');

// Helper: Generate Transaction ID
const generateTransactionId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let txId = 'TXN-';
  for (let i = 0; i < 12; i++) {
    txId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return txId;
};

// @desc    Make a donation
// @route   POST /api/donations
// @access  Public (Optional Auth)
const createDonation = async (req, res) => {
  try {
    const { donorName, amount, purpose, templeId } = req.body;

    if (!donorName || !amount) {
      return res.status(400).json({ success: false, message: 'Please provide donor name and amount' });
    }

    const transactionId = generateTransactionId();

    const donation = await Donation.create({
      user: req.user ? req.user._id : null,
      temple: templeId || null,
      donorName,
      amount,
      purpose: purpose || 'General',
      transactionId
    });

    res.status(201).json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all donations
// @route   GET /api/donations
// @access  Private (ADMIN)
const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('user', 'name email')
      .populate('temple', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: donations.length, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's donations
// @route   GET /api/donations/my-donations
// @access  Private (USER)
const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ user: req.user._id })
      .populate('temple', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: donations.length, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createDonation,
  getAllDonations,
  getMyDonations
};
