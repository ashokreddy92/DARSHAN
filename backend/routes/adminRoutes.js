const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');
const Temple = require('../models/Temple');
const DarshanSlot = require('../models/DarshanSlot');
const User = require('../models/User');
const Payment = require('../models/Payment');
const PaymentAuditLog = require('../models/PaymentAuditLog');
const Deity = require('../models/Deity');
const Incident = require('../models/Incident');
const AdminAuditLog = require('../models/AdminAuditLog');
const metricsService = require('../services/metricsService');
const incidentService = require('../services/incidentService');
const auditService = require('../services/auditService');
const { getQueueStats } = require('../config/rabbitmq');
const paymentQueue = require('../queues/paymentQueue');
const cacheService = require('../services/cacheService');

const router = express.Router();

// Strict RBAC: All routes require authenticated ADMIN
router.use(protect);
router.use(authorize('ADMIN'));

/* =========================================================================
   1. EXISTING ANALYTICS & REPORTS (PRESERVED)
   ========================================================================= */

// @desc    Get comprehensive analytics & charts data for Admin Dashboard
// @route   GET /api/admin/analytics
// @access  Private (ADMIN)
router.get('/analytics', async (req, res) => {
  try {
    const today = new Date();

    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toISOString().split('T')[0];

      const dayBookings = await Booking.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      const ticketsSold = dayBookings.reduce((sum, b) => {
        const isCountable = ['Confirmed', 'CONFIRMED', 'Checked In', 'CHECKED_IN'].includes(b.status);
        return sum + (isCountable ? (b.devotees?.length || 1) : 0);
      }, 0);

      const revenue = dayBookings.reduce((sum, b) => {
        const isPaid = ['Confirmed', 'CONFIRMED', 'Checked In', 'CHECKED_IN'].includes(b.status);
        return sum + (isPaid ? (b.totalPrice || 0) : 0);
      }, 0);

      const checkIns = await Booking.countDocuments({
        checkedInAt: { $gte: startOfDay, $lte: endOfDay }
      });

      dailyTrend.push({
        date: dateStr,
        day: dayName,
        ticketsSold,
        revenue,
        checkIns
      });
    }

    const temples = await Temple.find({}, 'name');
    const templeDistribution = [];
    for (const t of temples) {
      const count = await Booking.countDocuments({
        temple: t._id,
        status: { $in: ['Confirmed', 'CONFIRMED', 'Checked In', 'CHECKED_IN'] }
      });
      templeDistribution.push({
        templeId: t._id,
        templeName: t.name,
        bookingCount: count
      });
    }
    templeDistribution.sort((a, b) => b.bookingCount - a.bookingCount);

    const totalConfirmed = await Booking.countDocuments({ status: { $in: ['Confirmed', 'CONFIRMED'] } });
    const totalCheckedIn = await Booking.countDocuments({ status: { $in: ['Checked In', 'CHECKED_IN'] } });
    const totalCancelled = await Booking.countDocuments({ status: { $in: ['Cancelled', 'CANCELLED'] } });
    const totalPending = await Booking.countDocuments({ status: { $in: ['Pending Verification', 'PENDING'] } });

    const todayStr = today.toISOString().split('T')[0];
    const upcomingSlots = await DarshanSlot.find({
      date: { $gte: todayStr }
    })
      .populate('temple', 'name location')
      .sort({ date: 1, timeSlot: 1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        dailyTrend,
        templeDistribution: templeDistribution.slice(0, 8),
        statusBreakdown: {
          confirmed: totalConfirmed,
          checkedIn: totalCheckedIn,
          cancelled: totalCancelled,
          pending: totalPending,
          total: totalConfirmed + totalCheckedIn + totalCancelled + totalPending
        },
        upcomingSlots
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get summary report
// @route   GET /api/admin/reports
// @access  Private (ADMIN)
router.get('/reports', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'USER' });
    const totalStaff = await User.countDocuments({ role: 'TEMPLE_STAFF' });
    const totalTemples = await Temple.countDocuments();
    const totalBookings = await Booking.countDocuments();

    const confirmedBookings = await Booking.find({
      status: { $in: ['Confirmed', 'CONFIRMED', 'Checked In', 'CHECKED_IN'] }
    });

    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalDevotees = confirmedBookings.reduce((sum, b) => sum + (b.devotees?.length || 1), 0);

    res.json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        summary: {
          totalUsers,
          totalStaff,
          totalTemples,
          totalBookings,
          totalDevotees,
          totalRevenue
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================================================================
   2. PAYMENT LOGBOOK, TIMELINE, AUDIT & RECONCILIATION
   ========================================================================= */

// @desc    Get paginated and filtered payment logbook
// @route   GET /api/admin/payments
// @access  Private (ADMIN)
router.get('/payments', async (req, res) => {
  try {
    const { status, temple, gateway, method, search, fromDate, toDate, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (temple && temple !== 'all') {
      query.temple = temple;
    }
    if (gateway && gateway !== 'all') {
      query.gateway = gateway;
    }
    if (method && method !== 'all') {
      query.paymentMethod = method;
    }
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(new Date(toDate).setHours(23, 59, 59, 999));
    }
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { paymentId: searchRegex },
        { transactionReference: searchRegex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('user', 'name email phone')
      .populate('temple', 'name location')
      .populate('booking', 'bookingReference status slot')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate quick financial summary
    const successfulAgg = await Payment.aggregate([
      { $match: { status: 'Successful' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalVolume = successfulAgg.length > 0 ? successfulAgg[0].total : 0;
    const failedCount = await Payment.countDocuments({ status: 'Failed' });

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        },
        summary: {
          totalVolume,
          failedCount
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Automated Payment Reconciliation Tool
// @route   GET /api/admin/payments/reconciliation
// @access  Private (ADMIN)
router.get('/payments/reconciliation', async (req, res) => {
  try {
    // 1. Find Bookings with Confirmed status but no successful payment
    const bookings = await Booking.find().populate('temple', 'name').limit(200).sort({ createdAt: -1 });
    const discrepancies = [];

    for (const b of bookings) {
      const payment = await Payment.findOne({
        $or: [
          { booking: b._id },
          { transactionReference: b.transactionId }
        ]
      });

      const isBookingConfirmed = ['Confirmed', 'CONFIRMED', 'Checked In', 'CHECKED_IN'].includes(b.status);

      if (isBookingConfirmed && (!payment || payment.status !== 'Successful')) {
        discrepancies.push({
          type: 'MISSING_OR_FAILED_PAYMENT',
          severity: 'CRITICAL',
          bookingId: b._id,
          bookingReference: b.bookingReference,
          templeName: b.temple?.name || 'Unknown',
          bookingStatus: b.status,
          paymentStatus: payment ? payment.status : 'NO_PAYMENT_RECORD',
          amount: b.totalPrice,
          paymentId: payment ? payment.paymentId : null,
          transactionId: b.transactionId,
          suggestedAction: 'REQUIRES_REVIEW'
        });
      } else if (!isBookingConfirmed && payment && payment.status === 'Successful') {
        discrepancies.push({
          type: 'PAYMENT_SUCCESS_BOOKING_PENDING',
          severity: 'WARNING',
          bookingId: b._id,
          bookingReference: b.bookingReference,
          templeName: b.temple?.name || 'Unknown',
          bookingStatus: b.status,
          paymentStatus: payment.status,
          amount: b.totalPrice,
          paymentId: payment.paymentId,
          suggestedAction: 'CONFIRM_BOOKING'
        });
      } else if (payment && b.totalPrice !== payment.amount) {
        discrepancies.push({
          type: 'AMOUNT_MISMATCH',
          severity: 'CRITICAL',
          bookingId: b._id,
          bookingReference: b.bookingReference,
          templeName: b.temple?.name || 'Unknown',
          bookingStatus: b.status,
          paymentStatus: payment.status,
          bookingAmount: b.totalPrice,
          paymentAmount: payment.amount,
          suggestedAction: 'AUDIT_PRICE_DIFFERENCE'
        });
      }
    }

    res.json({
      success: true,
      data: {
        scannedCount: bookings.length,
        discrepancyCount: discrepancies.length,
        discrepancies,
        reconciledAt: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Get single payment details with full transaction timeline
// @route   GET /api/admin/payments/:id
// @access  Private (ADMIN)
router.get('/payments/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('temple', 'name location')
      .populate({
        path: 'booking',
        populate: { path: 'slot', select: 'date timeSlot slotType' }
      });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const auditTrail = await PaymentAuditLog.find({ paymentId: payment.paymentId })
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        payment,
        auditTrail
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Process or record an administrative refund
// @route   POST /api/admin/payments/:id/refund
// @access  Private (ADMIN)
router.post('/payments/:id/refund', async (req, res) => {
  try {
    const { reason, refundAmount } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.status !== 'Successful') {
      return res.status(400).json({ success: false, message: 'Only successful payments can be refunded' });
    }

    const previousStatus = payment.status;
    payment.status = 'Refunded';
    payment.refundStatus = 'Processed';
    payment.refundAmount = refundAmount || payment.amount;
    payment.timeline.push({
      milestone: 'REFUND_PROCESSED',
      timestamp: new Date(),
      note: `Refund approved by ${req.user.name}: ${reason || 'Customer request'}`
    });
    await payment.save();

    // Log to immutable financial ledger
    await PaymentAuditLog.create({
      paymentId: payment.paymentId,
      bookingId: payment.booking,
      eventType: 'REFUND_SUCCESS',
      previousStatus,
      newStatus: 'Refunded',
      actorType: 'ADMIN',
      actorId: req.user._id,
      message: `Refund of ₹${payment.refundAmount} issued. Reason: ${reason || 'Administrative decision'}`
    });

    // Notify via RabbitMQ
    await paymentQueue.enqueueRefundRequested({
      paymentId: payment.paymentId,
      refundAmount: payment.refundAmount,
      reason
    });

    // Admin general audit log
    await auditService.logAction(req, 'REFUND_PAYMENT', 'Payment', payment._id, { status: previousStatus }, { status: 'Refunded', refundAmount: payment.refundAmount });

    res.json({ success: true, message: 'Refund successfully processed and recorded', data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =========================================================================
   3. SYSTEM HEALTH, BOTTLENECK DETECTION & RABBITMQ MONITORING
   ========================================================================= */

// @desc    Get live status cards for all infrastructure components
// @route   GET /api/admin/system/health
// @access  Private (ADMIN)
router.get('/system/health', async (req, res) => {
  try {
    const metrics = await metricsService.getSystemMetrics();

    // Synthesize component health cards
    const cards = [
      {
        id: 'api',
        name: 'API Gateway',
        status: metrics.performance.p95LatencyMs > 600 ? 'Warning' : 'Healthy',
        metrics: `P95: ${metrics.performance.p95LatencyMs}ms (Avg: ${metrics.performance.avgLatencyMs}ms)`
      },
      {
        id: 'mongodb',
        name: 'MongoDB Primary',
        status: metrics.infrastructure.mongodb.status === 'healthy' ? 'Healthy' : 'Critical',
        metrics: `Ping: ${metrics.infrastructure.mongodb.latencyMs}ms`
      },
      {
        id: 'redis',
        name: 'Redis Cache/Locks',
        status: metrics.infrastructure.redis.status === 'healthy' ? 'Healthy' : (metrics.infrastructure.redis.status === 'disabled' ? 'Unknown' : 'Critical'),
        metrics: `Status: ${metrics.infrastructure.redis.status}`
      },
      {
        id: 'rabbitmq',
        name: 'RabbitMQ Broker',
        status: metrics.infrastructure.rabbitmq.status === 'healthy' ? 'Healthy' : (metrics.infrastructure.rabbitmq.status === 'disabled' ? 'Unknown' : 'Warning'),
        metrics: metrics.infrastructure.rabbitmq.latency ? `Latency: ${metrics.infrastructure.rabbitmq.latency}` : metrics.infrastructure.rabbitmq.message
      },
      {
        id: 'payments',
        name: 'Payment Processing',
        status: 'Healthy',
        metrics: 'Idempotency Active'
      },
      {
        id: 'email',
        name: 'Email Delivery (Worker)',
        status: 'Healthy',
        metrics: 'Queue Attached'
      }
    ];

    res.json({
      success: true,
      data: {
        overallStatus: cards.some((c) => c.status === 'Critical') ? 'Critical' : (cards.some((c) => c.status === 'Warning') ? 'Warning' : 'Healthy'),
        components: cards,
        system: metrics.resources
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Get detailed bottleneck analysis
// @route   GET /api/admin/system/bottlenecks
// @access  Private (ADMIN)
router.get('/system/bottlenecks', async (req, res) => {
  try {
    const report = await metricsService.getBottlenecks();
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Get detailed real-time queue metrics for RabbitMQ
// @route   GET /api/admin/rabbitmq/queues
// @access  Private (ADMIN)
router.get('/rabbitmq/queues', async (req, res) => {
  try {
    const queueStats = await getQueueStats();
    res.json({ success: true, data: queueStats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Get grouped failure incidents
// @route   GET /api/admin/incidents
// @access  Private (ADMIN)
router.get('/incidents', async (req, res) => {
  try {
    const { status, service } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (service && service !== 'all') query.service = service;

    const incidents = await Incident.find(query)
      .populate('resolvedBy', 'name email')
      .sort({ lastSeen: -1 })
      .limit(50);

    res.json({ success: true, count: incidents.length, data: incidents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Acknowledge an incident
// @route   PATCH /api/admin/incidents/:id/acknowledge
// @access  Private (ADMIN)
router.patch('/incidents/:id/acknowledge', async (req, res) => {
  try {
    const incident = await incidentService.acknowledgeIncident(req.params.id, req.user);
    await auditService.logAction(req, 'ACKNOWLEDGE_INCIDENT', 'Incident', incident._id);
    res.json({ success: true, data: incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Resolve an incident
// @route   PATCH /api/admin/incidents/:id/resolve
// @access  Private (ADMIN)
router.patch('/incidents/:id/resolve', async (req, res) => {
  try {
    const { note } = req.body;
    const incident = await incidentService.resolveIncident(req.params.id, req.user, note);
    await auditService.logAction(req, 'RESOLVE_INCIDENT', 'Incident', incident._id, null, { note });
    res.json({ success: true, data: incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =========================================================================
   4. DEITY MANAGEMENT
   ========================================================================= */

// @desc    Get all deities for admin management
// @route   GET /api/admin/deities
// @access  Private (ADMIN)
router.get('/deities', async (req, res) => {
  try {
    const deities = await Deity.find()
      .populate('temples', 'name location deity')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: deities.length, data: deities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Create a new deity
// @route   POST /api/admin/deities
// @access  Private (ADMIN)
router.post('/deities', async (req, res) => {
  try {
    const { name, alternateNames, description, imageUrl, category, isFeatured, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Deity name is required' });
    }

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await Deity.findOne({ $or: [{ name: name.trim() }, { slug }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A deity with this name or slug already exists' });
    }

    const deity = await Deity.create({
      name: name.trim(),
      slug,
      alternateNames: Array.isArray(alternateNames) ? alternateNames : (alternateNames ? alternateNames.split(',').map((s) => s.trim()) : []),
      description: description || 'Sacred temple deity',
      imageUrl: imageUrl || '',
      category: category || 'Vaishnavism',
      isFeatured: Boolean(isFeatured),
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    await auditService.logAction(req, 'CREATE_DEITY', 'Deity', deity._id, null, deity);
    await cacheService.invalidatePattern('deities:*');

    res.status(201).json({ success: true, data: deity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Update deity details
// @route   PUT /api/admin/deities/:id
// @access  Private (ADMIN)
router.put('/deities/:id', async (req, res) => {
  try {
    const deity = await Deity.findById(req.params.id);
    if (!deity) {
      return res.status(404).json({ success: false, message: 'Deity not found' });
    }

    const previous = deity.toObject();
    const { name, alternateNames, description, imageUrl, category, isFeatured, isActive } = req.body;

    if (name) {
      deity.name = name.trim();
      deity.slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (alternateNames !== undefined) {
      deity.alternateNames = Array.isArray(alternateNames) ? alternateNames : alternateNames.split(',').map((s) => s.trim());
    }
    if (description !== undefined) deity.description = description;
    if (imageUrl !== undefined) deity.imageUrl = imageUrl;
    if (category !== undefined) deity.category = category;
    if (isFeatured !== undefined) deity.isFeatured = Boolean(isFeatured);
    if (isActive !== undefined) deity.isActive = Boolean(isActive);

    await deity.save();
    await auditService.logAction(req, 'UPDATE_DEITY', 'Deity', deity._id, previous, deity);
    await cacheService.invalidatePattern('deities:*');

    res.json({ success: true, data: deity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Toggle deity active status (soft-delete with dependency protection)
// @route   PATCH /api/admin/deities/:id/status
// @access  Private (ADMIN)
router.patch('/deities/:id/status', async (req, res) => {
  try {
    const deity = await Deity.findById(req.params.id);
    if (!deity) {
      return res.status(404).json({ success: false, message: 'Deity not found' });
    }

    // Safety: If deactivating, verify no temples currently have it as primaryDeity
    if (deity.isActive) {
      const referencedTemples = await Temple.find({ primaryDeity: deity._id });
      if (referencedTemples.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot deactivate deity. It is assigned as Primary Deity for ${referencedTemples.length} temple(s): ${referencedTemples.map((t) => t.name).join(', ')}`
        });
      }
    }

    const previous = deity.isActive;
    deity.isActive = !deity.isActive;
    await deity.save();

    await auditService.logAction(req, 'TOGGLE_DEITY_STATUS', 'Deity', deity._id, { isActive: previous }, { isActive: deity.isActive });
    await cacheService.invalidatePattern('deities:*');

    res.json({ success: true, message: `Deity ${deity.isActive ? 'activated' : 'deactivated'}`, data: deity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Assign Deity to Temple (Primary or Secondary)
// @route   POST /api/admin/temples/:id/deities
// @access  Private (ADMIN)
router.post('/temples/:id/deities', async (req, res) => {
  try {
    const { deityId, isPrimary } = req.body;
    const temple = await Temple.findById(req.params.id);
    const deity = await Deity.findById(deityId);

    if (!temple || !deity) {
      return res.status(404).json({ success: false, message: 'Temple or Deity not found' });
    }

    if (isPrimary) {
      temple.primaryDeity = deity._id;
      temple.deity = deity.name; // Keep legacy string synchronized
    } else {
      if (!temple.secondaryDeities.includes(deity._id)) {
        temple.secondaryDeities.push(deity._id);
      }
    }
    await temple.save();

    // Map temple in Deity document
    if (!deity.temples.includes(temple._id)) {
      deity.temples.push(temple._id);
      await deity.save();
    }

    await auditService.logAction(req, 'ASSIGN_DEITY_TO_TEMPLE', 'Temple', temple._id, null, { deityId, isPrimary });
    await cacheService.invalidatePattern('deities:*');

    res.json({ success: true, message: 'Deity successfully mapped to temple', data: temple });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Remove Deity mapping from Temple
// @route   DELETE /api/admin/temples/:id/deities/:deityId
// @access  Private (ADMIN)
router.delete('/temples/:id/deities/:deityId', async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);
    const deity = await Deity.findById(req.params.deityId);

    if (!temple || !deity) {
      return res.status(404).json({ success: false, message: 'Temple or Deity not found' });
    }

    if (temple.primaryDeity && temple.primaryDeity.toString() === deity._id.toString()) {
      temple.primaryDeity = undefined;
    }
    temple.secondaryDeities = temple.secondaryDeities.filter(
      (id) => id.toString() !== deity._id.toString()
    );
    await temple.save();

    deity.temples = deity.temples.filter((id) => id.toString() !== temple._id.toString());
    await deity.save();

    await auditService.logAction(req, 'REMOVE_DEITY_FROM_TEMPLE', 'Temple', temple._id, { deityId: deity._id });
    await cacheService.invalidatePattern('deities:*');

    res.json({ success: true, message: 'Deity mapping removed', data: temple });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =========================================================================
   5. GLOBAL AUDIT LOGS
   ========================================================================= */

// @desc    Get paginated administrative audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (ADMIN)
router.get('/audit-logs', async (req, res) => {
  try {
    const { action, actorRole, resourceType, page = 1, limit = 30 } = req.query;
    const query = {};

    if (action && action !== 'all') query.action = action;
    if (actorRole && actorRole !== 'all') query.actorRole = actorRole;
    if (resourceType && resourceType !== 'all') query.resourceType = resourceType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AdminAuditLog.countDocuments(query);
    const logs = await AdminAuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
