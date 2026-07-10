const Temple = require('../models/Temple');

// @desc    Get all temples
// @route   GET /api/temples
// @access  Public
const getTemples = async (req, res) => {
  try {
    const temples = await Temple.find();
    res.json({ success: true, count: temples.length, data: temples });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single temple
// @route   GET /api/temples/:id
// @access  Public
const getTempleById = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);
    if (!temple) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }
    res.json({ success: true, data: temple });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new temple
// @route   POST /api/temples
// @access  Private (ADMIN, ORGANIZER)
const createTemple = async (req, res) => {
  try {
    const { name, city, state, description, deity, imageUrl, openingHours, speciality } = req.body;

    const temple = await Temple.create({
      name,
      location: { city, state },
      description,
      deity,
      imageUrl: imageUrl || '',
      openingHours: openingHours || '06:00 AM - 09:00 PM',
      speciality: speciality || '',
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: temple });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update temple
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

    const { name, city, state, description, deity, imageUrl, openingHours, speciality } = req.body;

    temple.name = name || temple.name;
    if (city || state) {
      temple.location = {
        city: city || temple.location.city,
        state: state || temple.location.state
      };
    }
    temple.description = description || temple.description;
    temple.deity = deity || temple.deity;
    temple.imageUrl = imageUrl !== undefined ? imageUrl : temple.imageUrl;
    temple.openingHours = openingHours || temple.openingHours;
    temple.speciality = speciality !== undefined ? speciality : temple.speciality;

    await temple.save();

    res.json({ success: true, data: temple });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete temple
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
