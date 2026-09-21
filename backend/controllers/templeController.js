const Temple = require('../models/Temple');
const cacheService = require('../services/cacheService');
const redisKeys = require('../utils/redisKeys');

// @desc    Get all temples (Cached for 10 minutes)
// @route   GET /api/temples
// @access  Public
const getTemples = async (req, res) => {
  try {
    const cacheKey = redisKeys.templesList('all');
    const temples = await cacheService.getOrSet(
      cacheKey,
      async () => await Temple.find().populate('primaryDeity secondaryDeities'),
      600 // 10 minutes
    );

    res.json({ success: true, count: temples.length, data: temples });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single temple (Cached for 15 minutes)
// @route   GET /api/temples/:id
// @access  Public
const getTempleById = async (req, res) => {
  try {
    const cacheKey = redisKeys.temple(req.params.id);
    const temple = await cacheService.getOrSet(
      cacheKey,
      async () => await Temple.findById(req.params.id).populate('primaryDeity secondaryDeities'),
      900 // 15 minutes
    );

    if (!temple) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }
    res.json({ success: true, data: temple });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new temple (Invalidates temple lists)
// @route   POST /api/temples
// @access  Private (ADMIN, ORGANIZER)
const createTemple = async (req, res) => {
  try {
    const { name, city, state, description, deity, imageUrl, openingHours, speciality, primaryDeity, secondaryDeities } = req.body;

    const temple = await Temple.create({
      name,
      location: { city, state },
      description,
      deity,
      primaryDeity: primaryDeity || undefined,
      secondaryDeities: secondaryDeities || [],
      imageUrl: imageUrl || '',
      openingHours: openingHours || '06:00 AM - 09:00 PM',
      speciality: speciality || '',
      createdBy: req.user._id
    });

    // Invalidate temple list cache
    await cacheService.invalidatePattern(redisKeys.templesListPattern());

    res.status(201).json({ success: true, data: temple });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update temple (Invalidates single temple & list caches)
// @route   PUT /api/temples/:id
// @access  Private (ADMIN, ORGANIZER)
const updateTemple = async (req, res) => {
  try {
    let temple = await Temple.findById(req.params.id);

    if (!temple) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }

    // Check ownership: Admin can edit anything. Organizers can only edit temples they created.
    if (req.user.role !== 'ADMIN' && temple.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this temple'
      });
    }

    const { name, city, state, description, deity, imageUrl, openingHours, speciality, primaryDeity, secondaryDeities } = req.body;

    temple.name = name || temple.name;
    if (city || state) {
      temple.location = {
        city: city || temple.location.city,
        state: state || temple.location.state
      };
    }
    temple.description = description || temple.description;
    temple.deity = deity || temple.deity;
    if (primaryDeity !== undefined) temple.primaryDeity = primaryDeity || null;
    if (secondaryDeities !== undefined) temple.secondaryDeities = secondaryDeities;
    temple.imageUrl = imageUrl !== undefined ? imageUrl : temple.imageUrl;
    temple.openingHours = openingHours || temple.openingHours;
    temple.speciality = speciality !== undefined ? speciality : temple.speciality;

    await temple.save();

    // Invalidate both the single temple and list caches
    await cacheService.invalidate(redisKeys.temple(req.params.id));
    await cacheService.invalidatePattern(redisKeys.templesListPattern());

    res.json({ success: true, data: temple });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete temple (Invalidates caches)
// @route   DELETE /api/temples/:id
// @access  Private (ADMIN)
const deleteTemple = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);

    if (!temple) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }

    // Only ADMIN can delete
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Administrators can delete temples'
      });
    }

    await temple.deleteOne();

    // Invalidate caches
    await cacheService.invalidate(redisKeys.temple(req.params.id));
    await cacheService.invalidatePattern(redisKeys.templesListPattern());

    res.json({ success: true, message: 'Temple removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTemples,
  getTempleById,
  createTemple,
  updateTemple,
  deleteTemple
};
