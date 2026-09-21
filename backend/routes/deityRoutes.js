/**
 * DarshanEase — Public Deity Routes
 * Features:
 * - Search by deity name or alternate names
 * - Category filter (Vaishnavism, Shaivism, Shakta, etc.)
 * - Redis caching for frequently accessed deity data
 * - Associated temples lookup
 */

const express = require('express');
const router = express.Router();
const Deity = require('../models/Deity');
const cacheService = require('../services/cacheService');

/**
 * @desc    Get all active deities with optional category and search filter
 * @route   GET /api/deities
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    const cacheKey = `deities:${category || 'all'}:${search || 'none'}:${featured || 'false'}`;

    const deities = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const query = { isActive: true };

        if (category && category !== 'all') {
          query.category = category;
        }

        if (featured === 'true') {
          query.isFeatured = true;
        }

        if (search && search.trim()) {
          const searchRegex = new RegExp(search.trim(), 'i');
          query.$or = [
            { name: searchRegex },
            { alternateNames: { $in: [searchRegex] } },
            { description: searchRegex }
          ];
        }

        return await Deity.find(query)
          .populate('temples', 'name location imageUrl deity')
          .sort({ isFeatured: -1, name: 1 });
      },
      600 // 10 minutes
    );

    res.json({
      success: true,
      count: deities.length,
      data: deities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @desc    Get deity details by slug or ID with associated temples
 * @route   GET /api/deities/:slug
 * @access  Public
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const isId = slug.match(/^[0-9a-fA-F]{24}$/);

    const deity = await Deity.findOne(
      isId ? { _id: slug } : { slug: slug.toLowerCase() }
    ).populate('temples', 'name location imageUrl openingHours description');

    if (!deity) {
      return res.status(404).json({ success: false, message: 'Deity not found' });
    }

    res.json({
      success: true,
      data: deity
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
